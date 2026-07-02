import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import type {
  CompanyMemberProfile,
  CompanyProfile,
} from "../types/companyProfile";
import { getCurrentCompanyProfile } from "../services/company/getCurrentCompany";

interface CompanyContextValue {
  company: CompanyProfile | null;
  member: CompanyMemberProfile | null;
  isLoading: boolean;
  errorMessage: string;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(
  undefined
);

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const { user, isAuthenticated } = useAuth();

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [member, setMember] = useState<CompanyMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function refreshCompany() {
    if (!user?.id) {
      setCompany(null);
      setMember(null);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const profile = await getCurrentCompanyProfile(user.id);

      setCompany(profile.company);
      setMember(profile.member);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la empresa."
      );

      setCompany(null);
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setCompany(null);
      setMember(null);
      setErrorMessage("");
      return;
    }

    refreshCompany();
  }, [isAuthenticated, user?.id]);

  const value = useMemo<CompanyContextValue>(
    () => ({
      company,
      member,
      isLoading,
      errorMessage,
      refreshCompany,
    }),
    [company, member, isLoading, errorMessage]
  );

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("useCompany debe usarse dentro de CompanyProvider");
  }

  return context;
}