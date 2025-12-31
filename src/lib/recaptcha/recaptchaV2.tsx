"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export type RecaptchaV2Handle = {
  execute: () => Promise<string>; // invisible: runs captcha; checkbox: returns last token
  reset: () => void;
};

type Props = {
  variant?: "checkbox" | "invisible";
  onToken?: (t: string) => void;
  badge?: "bottomright" | "bottomleft" | "inline";
};

const RecaptchaV2 = forwardRef<RecaptchaV2Handle, Props>(
  ({ variant = "invisible", onToken, badge = "bottomright" }, ref) => {
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;
    const widgetRef = useRef<ReCAPTCHA>(null);
    const last = useRef<string>("");

    useImperativeHandle(ref, () => ({
      execute: async () => {
        if (!widgetRef.current) return "";
        if (variant === "invisible") {
          const token = await widgetRef.current.executeAsync();
          last.current = token || "";
          onToken?.(last.current);
          widgetRef.current.reset();
          return last.current;
        }
        // checkbox
        return last.current;
      },
      reset: () => {
        last.current = "";
        widgetRef.current?.reset();
      },
    }));

    const handle = (t: string | null) => {
      last.current = t || "";
      onToken?.(last.current);
    };

    if (variant === "checkbox") {
      return (
        <ReCAPTCHA
          ref={widgetRef}
          sitekey={key}
          onChange={handle}
          onErrored={() => handle(null)}
          onExpired={() => handle(null)}
        />
      );
    }

    return (
      <ReCAPTCHA
        ref={widgetRef}
        sitekey={key}
        size="invisible"
        badge={badge}
        onChange={handle}
        onErrored={() => handle(null)}
        onExpired={() => handle(null)}
      />
    );
  }
);

RecaptchaV2.displayName = "RecaptchaV2";
export default RecaptchaV2;
