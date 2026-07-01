"use client";

import { apiFetch } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type YearlyData = {
    year: number;
    asset: number;
};

type SimulationResponse = {
    totalInvestment: number;
    finalAmount: number;
    profit: number;
    yearlyData: YearlyData[];
};

function MyChart({ data }: { data: YearlyData[] }) {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="asset" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function SimulationPage() {
    const [monthlyAmount, setMonthlyAmount] = useState(30000);
    const [annualReturn, setAnnualReturn] = useState(5);
    const [years, setYears] = useState(20);
    const [result, setResult] = useState<SimulationResponse | null>(null);
    const [monteCarloResult, setMonteCarloResult] = useState<number[] | null>(null);
    const [monteCarloId, setMonteCarloId] = useState(0);
    const [aiExplanation, setAiExplanation] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleSimulation = async () => {

        try {
            const res = await apiFetch(`${API_BASE}/api/simulation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    monthlyAmount,
                    annualReturn,
                    years,
                })
            });

            const data = await res.json();

            setResult(data);
        } catch (error: any) {
            console.log(error.response?.data);

            alert(error.response?.data?.message);
        }
    };

    const handleMonteCarlo = async () => {
        try {

            const res = await apiFetch(`${API_BASE}/api/simulation/montecarlo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    monthlyAmount,
                    annualReturn,
                    years,
                })
            });

            const data = await res.json();

            setMonteCarloResult(data.finalAssets);
            setMonteCarloId(data.simulationId);
        } catch (error: any) {
            console.log(error.response?.data);

            alert(error.response?.data?.message);
        }
    };

    const histogramDataArray = useMemo(() => {
        const arr = Array.isArray(monteCarloResult)
            ? monteCarloResult
            : [];

        return Object.entries(
            arr.reduce((acc: Record<string, number>, value) => {
                const key = Math.floor(value / 1000000) * 1000000;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        )
            .map(([key, value]) => ({
                range: `${Number(key) / 1000000}M`,
                key: Number(key),
                count: value,
            }))
            .sort((a, b) => a.key - b.key);
    }, [monteCarloResult]);

    const handleExplain = async () => {
        setLoading(true);

        try {

            const res = await apiFetch(`${API_BASE}/api/simulation/montecarlo/explain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    simulationId: monteCarloId.toString(),
                })
            });

            const text = await res.text();

            setAiExplanation(text);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

    }, []);

    return (
        <AuthGuard>
        <main>
            <div className="max-w-md mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6">
                    積立シミュレーション
                </h1>
                    
                <div className="mb-4">
                    <label className="block mb-2">
                        毎月積立額
                    </label>
                    <input
                        className="border rounded p-2 w-full text-black"
                        type="number"
                        value={monthlyAmount}
                        onChange={(e) =>
                            setMonthlyAmount(Number(e.target.value))
                        }
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">
                        年利 (%)
                    </label>
                    <input
                        className="border rounded p-2 w-full text-black"
                        type="number"
                        value={annualReturn}
                        onChange={(e) =>
                            setAnnualReturn(Number(e.target.value))
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2">
                        運用年数
                    </label>
                    <input
                        className="border rounded p-2 w-full text-black"
                        type="number"
                        value={years}
                        onChange={(e) =>
                            setYears(Number(e.target.value))
                        }
                    />
                </div>

                <div>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleSimulation}
                    >
                        計算する
                    </button>

                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded mt-2"
                        onClick={handleMonteCarlo}
                    >
                        モンテカルロ実行
                    </button>

                    <button
                        className={`px-4 py-2 rounded mt-2 text-white ${monteCarloResult
                            ? "bg-purple-600"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                        disabled={loading || !monteCarloId}
                        onClick={handleExplain}
                    >
                        {loading ? 'AI解析中...' : 'AI解説'}
                    </button>
                </div>

                {result && (
                    <div>
                        <h2>結果</h2>

                        <p>
                            積立総額：
                            {result.totalInvestment.toLocaleString()}円
                        </p>

                        <p>
                            最終資産額：
                            {result.finalAmount.toLocaleString()}円
                        </p>

                        <p>
                            利益：
                            {result.profit.toLocaleString()}円
                        </p>

                        <h2>資産推移</h2>

                        <div className="w-full h-[300px]">
                            <MyChart data={result.yearlyData} />
                        </div>

                        <h2 className="mt-6">年ごとの資産推移</h2>

                        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="w-full border-collapse border border-gray-300 mt-2">
                                <thead>
                                    <tr className="bg-gray-100 text-black">
                                        <th className="border p-2">年</th>
                                        <th className="border p-2">資産額</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(result?.yearlyData ?? []).map((row, index) => (
                                        <tr key={row.year} className="text-center">
                                            <td className="border p-2">{row.year}年</td>
                                            <td className="border p-2 text-right">
                                                {index === 0
                                                    ? '-'
                                                    : (row.asset - result.yearlyData[index - 1].asset).toLocaleString() + '円'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {monteCarloResult && (
                    <div className="mt-6">
                        <h2>資産分布（モンテカルロ）</h2>

                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={histogramDataArray}>
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {aiExplanation && (
                    <div className="mt-4 p-4 bg-gray-100 text-black rounded">
                        <h2>モンテカルロ AI解説（Gemini）</h2>

                        <textarea
                            readOnly
                            value={aiExplanation}
                            className="w-full h-40 border rounded p-2 bg-white resize-none"
                        />
                    </div>
                )}
            </div>
        </main>
        </AuthGuard>
    );
}