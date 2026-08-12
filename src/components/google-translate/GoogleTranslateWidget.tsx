"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface GoogleTranslateElementOptions {
  pageLanguage: string;
  includedLanguages: string;
  autoDisplay?: boolean;
}

interface GoogleTranslateInstance {
  new (
    options: GoogleTranslateElementOptions,
    elementId: string
  ): void;
}

interface GoogleTranslateNamespace {
  TranslateElement: GoogleTranslateInstance;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: GoogleTranslateNamespace;
    };
  }
}

export default function GoogleTranslateWidget() {
  const { language } = useLanguage();

  useEffect(() => {
    const triggerTranslation = (targetLang: string) => {
      const selectEl = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;
      if (selectEl) {
        if (targetLang === "en") {
          if (selectEl.value !== "en") {
            selectEl.value = "en";
            selectEl.dispatchEvent(new Event("change"));
          }
        } else {
          if (selectEl.value !== "" && selectEl.value !== "id") {
            selectEl.value = "";
            selectEl.dispatchEvent(new Event("change"));
          }
        }
      }
    };

    const initWidget = () => {
      const container = document.getElementById("google_translate_element");
      if (container) {
        container.innerHTML = "";
      }
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "id",
            includedLanguages: "en",
            autoDisplay: false,
          },
          "google_translate_element"
        );
        setTimeout(() => triggerTranslation(language), 300);
      }
    };

    window.googleTranslateElementInit = initWidget;

    const scriptId = "google-translate-script";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      initWidget();
    }
  }, []);

  useEffect(() => {
    const selectEl = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement | null;
    if (selectEl) {
      if (language === "en") {
        selectEl.value = "en";
        selectEl.dispatchEvent(new Event("change"));
      } else {
        selectEl.value = "";
        selectEl.dispatchEvent(new Event("change"));
      }
    }
  }, [language]);

  return <div id="google_translate_element" className="hidden" />;
}
