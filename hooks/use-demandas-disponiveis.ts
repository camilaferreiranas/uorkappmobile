import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { buscarDemandasDisponiveis, type DemandaDisponivel } from "../services/demandaService";

type ModoCarregamento = "inicial" | "atualizar" | "mais";

export function useDemandasDisponiveis(tamanhoPagina = 20) {
  const [demandas, setDemandas] = useState<DemandaDisponivel[]>([]);
  const [total, setTotal] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState("");
  const [erroMais, setErroMais] = useState("");
  const request = useRef<AbortController | null>(null);
  const ocupado = useRef(false);
  const proximaPagina = useRef(0);

  const carregar = useCallback(async (pagina: number, modo: ModoCarregamento) => {
    if (modo === "mais" && ocupado.current) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    ocupado.current = true;
    setErro("");
    setErroMais("");
    setCarregando(modo === "inicial");
    setAtualizando(modo === "atualizar");
    setCarregandoMais(modo === "mais");
    if (modo === "inicial") {
      setDemandas([]);
      setTotal(0);
      setTemMais(false);
    }

    try {
      const resultado = await buscarDemandasDisponiveis(pagina, tamanhoPagina, controller.signal);
      if (controller.signal.aborted) return;
      setDemandas((atuais) => modo === "mais"
        ? [...atuais, ...resultado.content.filter((item) => !atuais.some((atual) => atual.id === item.id))]
        : resultado.content);
      setTotal(resultado.totalElements);
      setTemMais(!resultado.last);
      proximaPagina.current = resultado.number + 1;
    } catch (error) {
      if (controller.signal.aborted) return;
      const mensagem = error instanceof Error ? error.message : "Não foi possível carregar as demandas.";
      if (modo === "mais") setErroMais(mensagem);
      else {
        setDemandas([]);
        setTotal(0);
        setTemMais(false);
        setErro(mensagem);
      }
    } finally {
      if (request.current === controller && !controller.signal.aborted) {
        ocupado.current = false;
        setCarregando(false);
        setAtualizando(false);
        setCarregandoMais(false);
      }
    }
  }, [tamanhoPagina]);

  useFocusEffect(useCallback(() => {
    void carregar(0, "inicial");
    return () => {
      request.current?.abort();
      ocupado.current = false;
    };
  }, [carregar]));

  return {
    demandas, total, temMais, carregando, atualizando, carregandoMais, erro, erroMais,
    recarregar: () => { void carregar(0, "inicial"); },
    atualizar: () => { void carregar(0, "atualizar"); },
    carregarMais: () => { if (temMais) void carregar(proximaPagina.current, "mais"); },
  };
}
