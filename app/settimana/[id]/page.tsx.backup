'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SettimanaPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const id = params.id as string;
    
    fetch(`/api/settimana?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Caricamento settimana...</p>
        </div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Errore nel caricamento</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full"
          >
            Torna alla home
          </button>
        </div>
      </main>
    );
  }

  const properties = data.page?.properties || {};
  const settimana = properties.Settimana?.title?.[0]?.plain_text || '';
  const titolo = properties.Titolo?.rich_text?.[0]?.plain_text || '';
  const tema = properties['Tema principale']?.rich_text?.[0]?.plain_text || '';
  const episodi = properties.Episodi?.rich_text?.[0]?.plain_text || '';

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
      {/* Header */}
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">  
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-500">
          <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            {settimana}
          </span>
          
          <h1 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
            {titolo}
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            {tema}
          </p>

          <div className="text-sm text-gray-500 border-t pt-4">
            📺 Episodi: {episodi}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📖 Contenuto della settimana
          </h2>

          {data.blocks && data.blocks.length > 0 ? (
            <div className="prose max-w-none">
              {data.blocks.map((block: any, index: number) => (
                <div key={block.id || index} className="mb-4">
                  {renderBlock(block)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              Contenuto completo disponibile su Notion.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

// Funzione helper per renderizzare blocchi Notion
function renderBlock(block: any) {
  const { type } = block;

  switch (type) {
    case 'paragraph':
      const pTexts = block.paragraph?.rich_text || [];
      if (pTexts.length === 0) return <br />;
      return (
        <p className="text-gray-700 leading-relaxed">
          {pTexts.map((t: any, i: number) => (
            <span key={i} className={t.annotations?.bold ? 'font-bold' : ''}>
              {t.plain_text}
            </span>
          ))}
        </p>
      );
    
    case 'heading_1':
      const h1Texts = block.heading_1?.rich_text || [];
      return (
        <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-4">
          {h1Texts.map((t: any) => t.plain_text).join('')}
        </h1>
      );
    
    case 'heading_2':
      const h2Texts = block.heading_2?.rich_text || [];
      return (
        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3">
          {h2Texts.map((t: any) => t.plain_text).join('')}
        </h2>
      );
    
    case 'heading_3':
      const h3Texts = block.heading_3?.rich_text || [];
      return (
        <h3 className="text-xl font-bold text-gray-700 mt-5 mb-2">
          {h3Texts.map((t: any) => t.plain_text).join('')}
        </h3>
      );
    
    case 'bulleted_list_item':
      const liTexts = block.bulleted_list_item?.rich_text || [];
      return (
        <li className="text-gray-700 ml-6 mb-2 list-disc">
          {liTexts.map((t: any) => t.plain_text).join('')}
        </li>
      );

    case 'numbered_list_item':
      const numTexts = block.numbered_list_item?.rich_text || [];
      return (
        <li className="text-gray-700 ml-6 mb-2 list-decimal">
          {numTexts.map((t: any) => t.plain_text).join('')}
        </li>
      );
    
    case 'quote':
      const quoteTexts = block.quote?.rich_text || [];
      return (
        <blockquote className="border-l-4 border-orange-400 pl-4 py-2 my-4 italic text-gray-700 bg-orange-50 rounded">
          {quoteTexts.map((t: any) => t.plain_text).join('')}
        </blockquote>
      );
    
    case 'divider':
      return <hr className="my-8 border-gray-300" />;
    
    case 'toggle':
      const toggleTexts = block.toggle?.rich_text || [];
      const toggleTitle = toggleTexts.map((t: any) => t.plain_text).join('');
      return (
        <details className="bg-gray-50 p-4 rounded-lg my-3 cursor-pointer">
          <summary className="font-semibold text-gray-800 cursor-pointer hover:text-orange-600">
            ▶ {toggleTitle}
          </summary>
          <div className="mt-3 pl-4 text-gray-600">
            {/* I contenuti dei toggle sono blocchi figli - per ora mostriamo solo il titolo */}
            <p className="text-sm italic">Clicca per espandere (contenuto completo su Notion)</p>
          </div>
        </details>
      );

    case 'callout':
      const calloutTexts = block.callout?.rich_text || [];
      const emoji = block.callout?.icon?.emoji || '💡';
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <p className="text-gray-700">
            {calloutTexts.map((t: any) => t.plain_text).join('')}
          </p>
        </div>
      );

    case 'code':
      const codeTexts = block.code?.rich_text || [];
      const codeContent = codeTexts.map((t: any) => t.plain_text).join('');
      return (
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg my-4 overflow-x-auto">
          <code>{codeContent}</code>
        </pre>
      );

    case 'image':
      const imageUrl = block.image?.file?.url || block.image?.external?.url;
      return imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Immagine" 
          className="rounded-lg my-4 max-w-full h-auto shadow-lg"
        />
      ) : null;

    case 'child_page':
      const childTitle = block.child_page?.title || 'Pagina collegata';
      return (
        <div className="bg-orange-50 border border-orange-200 rounded p-3 my-2">
          📄 {childTitle}
        </div>
      );

    default:
      // Per tipi non gestiti, mostra almeno qualcosa
      return (
        <div className="text-gray-400 text-sm italic my-2">
          [Blocco tipo: {type}]
        </div>
      );
  }
}