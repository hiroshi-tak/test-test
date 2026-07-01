"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from 'react';
import { apiFetch }  from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type Fund = {
    id: number;
    name: string;
    category: string;

    currentPrice: number;
    price1YearAgo: number;
    price3YearAgo: number;
    price5YearAgo: number;

    expenseRatio: number;
    netAssets: number;

    return1Year?: number;
    return3Year?: number;
    return5Year?: number;

    totalScore?: number;
};


export default function FundsPage() {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [scoreLoading, setScoreLoading] = useState(false);
    const [scoreCalculated, setScoreCalculated] = useState(false);


    useEffect(() => {
        const load = async () => {

            try {
                const res = await apiFetch(`${API_BASE}/api/funds`,{
                });

                const data = await res.json();

                console.log("data:", data);

                if (!Array.isArray(data)) {
                    console.error("Invalid response:", data);
                    return;
                }

                setFunds(data);
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    return (
        <AuthGuard>
            <main>
                <div className="max-w-md mx-auto p-8">
                    <h1 className="text-3xl font-bold mb-6">
                        人気ファンド比較
                    </h1>
                    

                    <h2 className="mt-6 text-xl font-semibold">
                        ファンド一覧
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="w-64 border border-gray-300">ファンド名</th>
                                    <th className="border border-gray-300">カテゴリ</th>
                                    <th className="border border-gray-300">現在</th>
                                    <th className="border border-gray-300">1年前</th>
                                    <th className="border border-gray-300">3年前</th>
                                    <th className="border border-gray-300">5年前</th>
                                    <th className="border border-gray-300">信託報酬</th>
                                    <th className="border border-gray-300">純資産</th>
                                </tr>
                            </thead>

                            <tbody>
                                {funds.map((fund) => (
                                    <tr key={fund.id}>
                                        <td className="border border-gray-300">{fund.name}</td>
                                        <td className="border border-gray-300">{fund.category}</td>

                                        <td className="border border-gray-300">{fund.currentPrice}</td>
                                        <td className="border border-gray-300">{fund.price1YearAgo}</td>
                                        <td className="border border-gray-300">{fund.price3YearAgo}</td>
                                        <td className="border border-gray-300">{fund.price5YearAgo}</td>

                                        <td className="border border-gray-300">{fund.expenseRatio}%</td>

                                        <td className="border border-gray-300">
                                            {fund.netAssets.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={scoreLoading}

                            onClick={async () => {
                                setScoreLoading(true);

                                try {
                                    const res = await apiFetch(`${API_BASE}/api/funds/score`, {
                                    });

                                    const data = await res.json();

                                    setFunds(data);
                                    setScoreCalculated(true);
                                } finally {
                                    setScoreLoading(false);
                                }
                            }}
                        >
                            {scoreLoading ? "算出中..." : "スコア算出"}
                        </button>

                        {scoreCalculated && funds.some(
                            fund => fund.totalScore !== undefined
                        ) && (
                                <div>
                                    <h2 className="mt-6 text-xl font-semibold">
                                        ランキング
                                    </h2>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-[900px] border-collapse border border-gray-300">
                                            <thead>
                                                <tr>
                                                    <th className="w-24 border border-gray-300">選択</th>
                                                    <th className="w-24 border border-gray-300">順位</th>
                                                    <th className="w-64 border border-gray-300">ファンド</th>
                                                    <th className="w-32 border border-gray-300">年利 1年</th>
                                                    <th className="w-32 border border-gray-300">年利 3年平均</th>
                                                    <th className="w-32 border border-gray-300">年利 5年平均</th>
                                                    <th className="w-24 border border-gray-300">スコア</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {[...funds]
                                                    .sort(
                                                        (a, b) =>
                                                            (b.totalScore ?? 0)
                                                            -
                                                            (a.totalScore ?? 0)
                                                    )
                                                    .map((fund, index) => (
                                                        <tr key={fund.id}>
                                                            <td className="border border-gray-300">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFunds.includes(fund.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {

                                                                            if (selectedFunds.length >= 2) {
                                                                                alert("比較できるのは2ファンドまでです");
                                                                                return;
                                                                            }

                                                                            setSelectedFunds([
                                                                                ...selectedFunds,
                                                                                fund.id,
                                                                            ]);

                                                                        } else {

                                                                            setSelectedFunds(
                                                                                selectedFunds.filter(
                                                                                    id => id !== fund.id
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="border border-gray-300">{index + 1}</td>

                                                            <td className="border border-gray-300">{fund.name}</td>

                                                            <td className="border border-gray-300">
                                                                {fund.return1Year?.toFixed(2)}%
                                                            </td>

                                                            <td className="border border-gray-300">
                                                                {fund.return3Year?.toFixed(2)}%
                                                            </td>

                                                            <td className="border border-gray-300">
                                                                {fund.return5Year?.toFixed(2)}%
                                                            </td>

                                                            <td className="border border-gray-300">
                                                                {fund.totalScore?.toFixed(1)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                    </div>

                    <div>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading}

                            onClick={async () => {
                                if (
                                    !funds.some(
                                        fund => fund.totalScore !== undefined
                                    )
                                ) {
                                    alert("先にスコア算出を実行してください");
                                    return;
                                }

                                if (selectedFunds.length !== 2) {
                                    alert("比較するファンドを2件選択してください");
                                    return;
                                }

                                setLoading(true);

                                try {
                                    const res = await apiFetch(`${API_BASE}/api/funds/analysis`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            fundIds: selectedFunds,
                                        })
                                    });

                                    const text = await res.text();

                                    setAnalysis(text);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            {loading ? 'AI分析中...' : 'AI比較解説'}
                        </button>

                        {analysis && (
                            <>
                                <h2 className="mt-6 text-xl font-semibold">
                                    AI解説
                                </h2>

                                <div
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: '10px',
                                        marginTop: '10px',
                                    }}
                                >
                                    {analysis}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}