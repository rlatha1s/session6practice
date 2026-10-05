"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Menu = {
    id: number;
    name: string;
    votes: number;
};

const menuEmoji: Record<string, string> = {
    엽떡: "🌶️",
    마라탕: "🍲",
    치킨: "🍗",
    피자: "🍕",
    초밥: "🍣",
    파스타: "🍝",
};

export default function Home() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [votingId, setVotingId] = useState<number | null>(null);

    async function loadMenus() {
        const { data, error } = await supabase
            .from("menus")
            .select("*")
            .order("id");

        if (error) {
            console.error(error);
            return;
        }

        setMenus(data ?? []);
        setLoading(false);
    }

    useEffect(() => {
        loadMenus();
    }, []);

    async function vote(menu: Menu) {
        setVotingId(menu.id);

        const { error } = await supabase
            .from("menus")
            .update({ votes: menu.votes + 1 })
            .eq("id", menu.id);

        if (error) {
            console.error(error);
            alert("투표에 실패했습니다.");
        } else {
            await loadMenus();
        }

        setVotingId(null);
    }

    const totalVotes = menus.reduce((sum, menu) => sum + menu.votes, 0);

    return (
        <main className="min-h-screen bg-orange-50 px-6 py-16 text-gray-900">
            <div className="mx-auto max-w-4xl">
                <header className="mb-12 text-center">
                    <div className="mb-4 text-6xl">🍽️</div>

                    <h1 className="text-5xl font-black tracking-tight">
                        저메추
                    </h1>

                    <p className="mt-4 text-xl text-gray-600">
                        저녁 메뉴 추천 좀.
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        먹고 싶은 메뉴에 한 표를 던져주세요!
                    </p>
                </header>

                {loading ? (
                    <p className="text-center text-gray-500">
                        메뉴를 불러오는 중...
                    </p>
                ) : (
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {menus.map((menu) => {
                            const percentage =
                                totalVotes === 0
                                    ? 0
                                    : Math.round(
                                          (menu.votes / totalVotes) * 100,
                                      );

                            return (
                                <article
                                    key={menu.id}
                                    className="rounded-3xl bg-white p-6 shadow-sm"
                                >
                                    <div className="text-5xl">
                                        {menuEmoji[menu.name]}
                                    </div>

                                    <h2 className="mt-4 text-2xl font-bold">
                                        {menu.name}
                                    </h2>

                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <span className="font-semibold">
                                            {menu.votes}표
                                        </span>
                                        <span className="text-gray-500">
                                            {percentage}%
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
                                        <div
                                            className="h-full rounded-full bg-orange-400"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <button
                                        onClick={() => vote(menu)}
                                        disabled={votingId !== null}
                                        className="mt-6 w-full rounded-2xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {votingId === menu.id
                                            ? "투표 중..."
                                            : "투표하기"}
                                    </button>
                                </article>
                            );
                        })}
                    </section>
                )}

                <p className="mt-10 text-center font-semibold text-gray-600">
                    총 {totalVotes}표
                </p>
            </div>
        </main>
    );
}
