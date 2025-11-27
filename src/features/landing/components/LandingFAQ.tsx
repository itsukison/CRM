'use client';

import React, { useState } from 'react';
import { COLORS } from '@/config/constants';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick, index }) => {
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-start justify-between text-left group hover:bg-gray-50 transition-colors px-4 rounded-lg"
            >
                <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-bold mt-1 text-gray-400 group-hover:text-[#0052FF] transition-colors">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-[#0052FF]' : 'text-[#0A0B0D]'}`}>
                        {question}
                    </span>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <span className="text-2xl font-light leading-none text-gray-400">+</span>
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pb-6 pl-12 pr-4 text-sm md:text-base text-gray-600 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export const LandingFAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "従来のCRMとの違いは何ですか？",
            answer: "従来のCRMは手動でデータを入力・管理するツールですが、flowlyはAIが自動的にリード情報を生成・収集します。営業チームはデータ入力ではなく、戦略立案と商談に専念できます。"
        },
        {
            question: "どのような企業情報を自動生成できますか？",
            answer: "会社名、業種、従業員数、所在地、URL、代表者名、資金調達情報など、定義したスキーマに基づいて様々な情報を自動生成できます。Web検索を通じて最新のニュースや財務情報も取得可能です。"
        },
        {
            question: "データの精度はどのくらいですか？",
            answer: "AIは最新のLLMを使用し、Web検索により公開情報をリアルタイムで取得します。ただし、生成されたデータは必ず確認いただくことを推奨します。重要な商談前には人手での検証をお願いします。"
        },
        {
            question: "既存のCRMからデータを移行できますか？",
            answer: "CSV、Excel等の形式でデータをインポート可能です。また、主要なCRMツールとのAPI連携もサポートしています。詳細は営業チームにお問い合わせください。"
        },
        {
            question: "無料プランでできることは？",
            answer: "無料プランでは1,000レコードまで保存可能で、基本的なAI生成機能（1日10回まで）をお試しいただけます。機能を制限なく使用したい場合は、プロプラン以上をご検討ください。"
        },
        {
            question: "カスタマイズは可能ですか？",
            answer: "はい、顧客ステータスのステージや、収集するデータ項目（カラム）を自由にカスタマイズできます。業界特有のデータ項目も簡単に追加可能です。"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-white border-t border-gray-200">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                {/* Adjusted gap here: changed 'gap-12' to 'gap-8 md:gap-12'
                    to bring the text and questions closer on mobile.
                */}
                <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-24">
                    {/* Left Column: Title & CTA */}
                    <div className="lg:w-1/3 flex flex-col justify-between">
                        <div>
                            <div className="inline-block px-4 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-mono mb-6 text-gray-500">
                                FAQ
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6 text-[#0A0B0D]">
                                ご質問に<br />お答えします
                            </h2>
                            {/* Adjusted margin here: changed 'mb-8' to 'mb-4 md:mb-8' 
                                to reduce space below this text on mobile. 
                            */}
                            <p className="text-gray-500 text-sm leading-relaxed md:mb-8">
                                flowlyの機能、料金、導入方法などについて、よくある質問をまとめました。
                                その他のご質問はチャットサポートまでお問い合わせください。
                            </p>
                        </div>

                        <div className="hidden lg:block p-6 bg-[#F5F5F7] rounded-2xl border border-[#E6E8EB]">
                            <div className="w-10 h-10 rounded-full bg-[#0052FF] mb-4 flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <h3 className="font-bold mb-2 text-sm">さらに質問がありますか？</h3>
                            <p className="text-xs text-gray-500 mb-4">チームとチャット</p>
                            <button className="w-full py-2 bg-[#0A0B0D] text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">
                                会話を始める
                            </button>
                            <div className="mt-4 text-center">
                                <span className="text-[10px] text-gray-400">または、メールでお問い合わせ <a href="mailto:support@flowly.ai" className="text-[#0052FF] hover:underline">support@flowly.ai</a></span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="lg:w-2/3">
                        <div className="space-y-2">
    {faqs.map((faq, index) => (
        // We wrap the item in a div to handle the visibility logic
        // index > 2 means "Hide the 4th item and onwards on mobile"
        <div 
            key={index} 
            className={index > 2 ? 'hidden md:block' : ''}
        >
            <FAQItem
                index={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => toggleIndex(index)}
            />
        </div>
    ))}
</div>
                        {/* Removed the 'Mobile Only CTA' block here */}
                    </div>
                </div>
            </div>
        </section>
    );
};