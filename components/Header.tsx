"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Header() {
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);

  return (
    <header className="p-4 bg-transparent flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-10 w-10 rounded-full"
          />
          <h1 className="text-sm">Normalno Auto</h1>
        </div>
        <div>
          <Link href="/" className="text-sm">
            {dict?.header.write_us || "Contact Us"}
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsOpenDropDown(!isOpenDropDown)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 rounded hover:bg-gray-800 transition-colors"
        >
          <label>{dict?.header.rules_of_work || "Work Rules"}</label>
          {isOpenDropDown ? (
            <ChevronUp className="inline ml-1" />
          ) : (
            <ChevronDown className="inline ml-1" />
          )}
        </button>
        {isOpenDropDown && (
          <div className="p-4 bg-gray-900 rounded shadow-md">
            <ul className="space-y-2">
              {dict?.header.rules_of_work_description?.map((rule, index) => (
                <li key={index}>
                  <h3 className="font-semibold">{rule.title}</h3>
                  <p className="text-gray-400 text-sm">{rule.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
