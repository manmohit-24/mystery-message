"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, ShieldCheck, Smile } from "lucide-react";
import LogoProvider from "@/components/LogoProvider";
import { constants } from "@/lib/constants";
import { useUserStore } from "@/store/user.store";
import HomeSkeleton from "@/components/skeletons/Home.Skeleton";

export default function () {
    const { user, isLoadingUser } = useUserStore();
    return isLoadingUser || user ? (
        <HomeSkeleton />
    ) : (
        <main className="h-full flex flex-col  bg-background text-foreground">
            {/* HERO */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-35">
                <div className="flex flex-col items-center">
                    <LogoProvider className="size-30" />
                    <p className="text-5xl font-extrabold"> {constants.appName} </p>
                </div>

                <h1 className="text-4xl sm:text-3xl mt-2 font-bold opacity-80  ">
                    Don’t gossip,
                    <span className="text-indigo-600"> just say it.</span>
                </h1>

                <p className="mt-4 text-muted-foreground max-w-md">
                    A simple way to send honest or anonymous messages — where words mean
                    more than drama.
                </p>

                <div className="mt-8 flex gap-4">
                    <Button className="w-60 text-md">
                        <Link href={`/${user ? "dashboard" : "login"}`}>Start Asking</Link>
                    </Button>
                </div>
            </section>

            <section className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
                <Feature
                    icon={<MessageSquare className="h-6 w-6 text-rose-500" />}
                    title="Say Anything"
                    desc="Send messages — anonymous or not — your choice."
                />
                <Feature
                    icon={<ShieldCheck className="h-6 w-6 text-violet-500" />}
                    title="Privacy First"
                    desc="Your words are yours — we keep it safe and private."
                />
                <Feature
                    icon={<Smile className="h-6 w-6 text-amber-500" />}
                    title="Stay Chill"
                    desc="A playful vibe that makes truth feel lighter."
                />
            </section>
        </main>
    );
}

function Feature({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <Card className="flex flex-col items-center text-center p-6 gap-3 border border-muted">
            <div className="p-3 rounded-full border border-muted-foreground">
                {icon}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </Card>
    );
}
