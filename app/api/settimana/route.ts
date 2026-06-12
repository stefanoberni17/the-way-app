import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Decodifica sequenze unicode letterali (es. u00f2 → ò) prodotte da copia-incolla
// errata in Notion. Allineato a app/api/episodio/route.ts.
function decodeUnicodeEscapes(text: string): string {
  return text.replace(/u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Strip di tag HTML letterali escapati (es. "\<i\>", "\</em\>") apparsi in
// alcuni testi generati con copia-incolla da AI.
function stripEscapedHtmlTags(text: string): string {
  return text.replace(/\\<\/?([a-zA-Z]{1,8})\\>/g, '');
}

function cleanText(text: string): string {
  return stripEscapedHtmlTags(decodeUnicodeEscapes(text));
}

// Applica la decodifica ai rich_text di un singolo blocco
function decodeBlockRichText(block: any): any {
  const type = block.type;
  if (!block[type]?.rich_text) return block;
  return {
    ...block,
    [type]: {
      ...block[type],
      rich_text: block[type].rich_text.map((rt: any) => ({
        ...rt,
        plain_text: cleanText(rt.plain_text || ''),
        text: rt.text
          ? { ...rt.text, content: cleanText(rt.text.content || '') }
          : rt.text,
      })),
    },
  };
}

// Applica la decodifica anche ai valori rich_text/title delle properties della pagina.
function decodePageProperties(page: any): any {
  if (!page?.properties) return page;
  const decodedProps: any = {};
  for (const [key, prop] of Object.entries<any>(page.properties)) {
    if (prop?.rich_text || prop?.title) {
      const arr = prop.rich_text || prop.title;
      const decodedArr = arr.map((rt: any) => ({
        ...rt,
        plain_text: cleanText(rt.plain_text || ''),
        text: rt.text
          ? { ...rt.text, content: cleanText(rt.text.content || '') }
          : rt.text,
      }));
      decodedProps[key] = prop.rich_text
        ? { ...prop, rich_text: decodedArr }
        : { ...prop, title: decodedArr };
    } else {
      decodedProps[key] = prop;
    }
  }
  return { ...page, properties: decodedProps };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID mancante' }, { status: 400 });
    }

    // Fetch contenuto pagina
    const pageResponse = await fetch('https://api.notion.com/v1/pages/' + pageId, {
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!pageResponse.ok) {
      const errText = await pageResponse.text();
      console.error('❌ Notion page fetch failed:', pageResponse.status, errText);
      return NextResponse.json(
        { error: 'Errore fetch pagina Notion', status: pageResponse.status },
        { status: 502 }
      );
    }

    const pageData = await pageResponse.json();

    // Fetch TUTTI i blocchi della pagina (con pagination)
    const allBlocks: any[] = [];
    let hasMore = true;
    let startCursor: string | null = null;

    while (hasMore) {
      let url = 'https://api.notion.com/v1/blocks/' + pageId + '/children';
      if (startCursor) {
        url = url + '?start_cursor=' + startCursor;
      }

      const blocksResponse = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!blocksResponse.ok) {
        const errText = await blocksResponse.text();
        console.error('❌ Notion blocks fetch failed:', blocksResponse.status, errText);
        return NextResponse.json(
          { error: 'Errore fetch blocchi Notion', status: blocksResponse.status },
          { status: 502 }
        );
      }

      const blocksData = await blocksResponse.json();

      allBlocks.push(...(blocksData.results || []));
      hasMore = blocksData.has_more || false;
      startCursor = blocksData.next_cursor || null;
    }

    // Decodifica unicode escape letterali su properties + blocchi (stesso fix
    // applicato in /api/episodio/route.ts — risolve i "caratteri strani" nella
    // vista approfondita).
    const decodedPage = decodePageProperties(pageData);
    const decodedBlocks = allBlocks.map(decodeBlockRichText);

    return NextResponse.json({
      page: decodedPage,
      blocks: decodedBlocks,
    });
  } catch (error: any) {
    console.error('❌ Errore /api/settimana:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
