/** Traduz falhas de conexão antes de exibi-las nas telas. */
export async function request(...args: Parameters<typeof fetch>): Promise<Response> {
  try {
    return await fetch(...args);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new Error('Houve um erro ao realizar essa operação. Tente novamente.');
  }
}
