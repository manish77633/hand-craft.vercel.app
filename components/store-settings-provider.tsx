"use client";
import { createContext, useContext } from "react";
import type { StoreSettings } from "@/lib/cms/site-settings";
const Context = createContext<StoreSettings | null>(null);
export function StoreSettingsProvider({ value, children }: { value: StoreSettings; children: React.ReactNode }) { return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useStoreSettings() { return useContext(Context); }
