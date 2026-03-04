"use client";

import SuperTokens from "supertokens-auth-react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import { appInfo } from "@/lib/supertokens/config";

if (typeof window !== "undefined") {
  SuperTokens.init({
    appInfo,
    recipeList: [EmailPassword.init(), Session.init()],
  });
}

export function SuperTokensProvider({ children }: { children: React.ReactNode }) {
  return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
}
