"use client";

import SuperTokens from "supertokens-auth-react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import UserRoles from "supertokens-auth-react/recipe/userroles";
import { appInfo } from "@/lib/supertokens/config";

if (typeof window !== "undefined") {
  SuperTokens.init({
    appInfo,
    recipeList: [
      EmailPassword.init({
        onHandleEvent: async (context) => {
          if (context.action === "SUCCESS" && context.isNewRecipeUser) {
            await fetch("/api/auth/assign-role", { method: "POST" });
          }
        },
      }),
      Session.init(),
      UserRoles.init(),
    ],
  });
}

export function SuperTokensProvider({ children }: { children: React.ReactNode }) {
  return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
}
