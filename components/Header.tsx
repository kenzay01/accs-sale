"use client";

import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
import { useCurrentLanguage } from "@/hooks/getCurrentLanguage";
import { useDictionary } from "@/hooks/getDictionary";
import { Locale } from "@/i18n/config";
import { useState } from "react";
import { ChevronDown, ChevronUp, Rocket } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const handleLogoClick = () => {
    router.push("/");
  };
  const currentLanguage = useCurrentLanguage() as Locale;
  const { dict } = useDictionary(currentLanguage);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);

  return (
    <header className="p-4 bg-transparent flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={handleLogoClick}>
          <Image
            src={logo}
            alt="Logo"
            width={100}
            height={100}
            className="h-14 w-14 rounded-full shadow-lg"
          />
          {/* <h1 className="text-sm">Normalno Auto</h1> */}
        </div>
        <div className="flex items-center justify-center gap-1">
          <div className="pt-1">
            <LanguageSwitcher currentLocale={currentLanguage} />
          </div>
          <div>
            <Link
              href="https://t.me/DrValuev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm py-2 px-4 rounded-full transition-colors cursor-pointer bg-gray-950 hover:bg-gray-900 border-2 border-gray-950 hover:border-red-500 text-white flex items-center"
            >
              <Rocket className="inline mr-1.5 w-5 h-auto" />
              <label className="cursor-pointer">
                {dict?.header.write_us || "Contact Us"}
              </label>
            </Link>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsOpenDropDown(!isOpenDropDown)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-950 hover:bg-gray-900 border-2 border-gray-950 hover:border-red-500 rounded  transition-colors"
        >
          <label>{dict?.header.rules_of_work || "Work Rules"}</label>
          {isOpenDropDown ? (
            <ChevronUp className="inline ml-1" />
          ) : (
            <ChevronDown className="inline ml-1" />
          )}
        </button>
        {isOpenDropDown && (
          <div className="p-4 bg-gray-950 hover:bg-gray-900 border-2 border-gray-950  rounded shadow-md">
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
      </div> */}
    </header>
  );
}
