import { Redirect } from "expo-router";

/** Mantém links antigos funcionando após a unificação em Meus serviços. */
export default function MyProposalsRedirect() {
  return <Redirect href="/client-history" />;
}
