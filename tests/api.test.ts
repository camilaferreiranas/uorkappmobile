import {
  ApiRequestError,
  getAddressByCep,
  getUserProfile,
  login,
  loginWithGoogle,
  removeUserProfilePhoto,
  updateUserAddress,
  updateUserProfile,
  uploadUserProfilePhoto,
} from '../services/api';
import { installFetchMock } from './helpers/mock-fetch';
import { clearStoredToken, expiredToken, seedStoredToken, validToken } from './helpers/mock-token';

const PERFIL = {
  id: 1,
  nome: 'Ana',
  sobrenome: 'Silva',
  email: 'ana@exemplo.com',
  documento: '12345678900',
  telefone: '11988776655',
  tipoPessoa: 'CPF' as const,
  endereco: {
    rua: 'Rua A',
    numero: '10',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01000-000',
  },
  fotoPerfilUrl: null,
  totalServicosFinalizados: 0,
  mediaAvaliacoesCliente: 0,
};

afterEach(() => {
  clearStoredToken();
});

describe('login', () => {
  it('retorna accessToken e expiresIn no formato direto', async () => {
    const fetchMock = installFetchMock([
      { match: '/login', body: { accessToken: 'tk', expiresIn: 3600 } },
    ]);

    const resultado = await login({ email: 'a@b.c', senha: 'x' });

    expect(resultado).toEqual({ accessToken: 'tk', expiresIn: 3600 });
    const { url, init } = fetchMock.calls[0];
    expect(url).toContain('/login');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'a@b.c', senha: 'x' });
    fetchMock.restore();
  });

  it('aceita resposta envelopada em data', async () => {
    installFetchMock([
      { match: '/login', body: { data: { accessToken: 'tk2', expiresIn: 60 } } },
    ]);

    const resultado = await login({ email: 'a@b.c', senha: 'x' });
    expect(resultado.accessToken).toBe('tk2');
  });

  it('rejeita resposta sem accessToken', async () => {
    installFetchMock([{ match: '/login', body: { expiresIn: 60 } }]);

    await expect(login({ email: 'a@b.c', senha: 'x' })).rejects.toThrow(
      'Resposta de login inválida.'
    );
  });

  it('usa a primeira mensagem de erros quando não ok', async () => {
    installFetchMock([
      { match: '/login', status: 401, body: { erros: ['Credenciais inválidas'] } },
    ]);

    await expect(login({ email: 'a@b.c', senha: 'x' })).rejects.toThrow(
      'Credenciais inválidas'
    );
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([{ match: '/login', status: 400, body: { message: 'Bloqueado' } }]);

    await expect(login({ email: 'a@b.c', senha: 'x' })).rejects.toThrow('Bloqueado');
  });

  it('usa mensagem padrão quando o corpo é inválido', async () => {
    installFetchMock([{ match: '/login', status: 401, invalidJson: true }]);

    await expect(login({ email: 'a@b.c', senha: 'x' })).rejects.toThrow(
      'E-mail ou senha inválidos.'
    );
  });
});

describe('loginWithGoogle', () => {
  const payload = {
    idToken: 'id',
    googleId: 'g',
    email: 'a@b.c',
    nome: 'Ana',
    sobrenome: 'Silva',
  };

  it('autentica com sucesso', async () => {
    const fetchMock = installFetchMock([
      { match: '/auth/google', body: { accessToken: 'gt', expiresIn: 120 } },
    ]);

    const resultado = await loginWithGoogle(payload);

    expect(resultado.accessToken).toBe('gt');
    expect(fetchMock.calls[0].url).toContain('/auth/google');
    fetchMock.restore();
  });

  it('propaga a mensagem da API', async () => {
    installFetchMock([
      { match: '/auth/google', status: 403, body: { message: 'Conta não autorizada' } },
    ]);

    await expect(loginWithGoogle(payload)).rejects.toThrow('Conta não autorizada');
  });

  it('usa mensagem padrão sem corpo', async () => {
    installFetchMock([{ match: '/auth/google', status: 500, invalidJson: true }]);

    await expect(loginWithGoogle(payload)).rejects.toThrow(
      'Erro ao autenticar com Google. Tente novamente.'
    );
  });
});

describe('getUserProfile', () => {
  it('retorna o perfil com Authorization', async () => {
    const fetchMock = installFetchMock([
      { match: '/usuario/perfil', body: { success: true, data: PERFIL } },
    ]);

    const perfil = await getUserProfile('tk');

    expect(perfil.nome).toBe('Ana');
    const { init } = fetchMock.calls[0];
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tk' });
    fetchMock.restore();
  });

  it('lança ApiRequestError com status em erros', async () => {
    installFetchMock([
      { match: '/usuario/perfil', status: 404, body: { erros: ['Perfil não encontrado'] } },
    ]);

    const erro = await getUserProfile('tk').catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiRequestError);
    expect((erro as ApiRequestError).message).toBe('Perfil não encontrado');
    expect((erro as ApiRequestError).status).toBe(404);
    expect((erro as ApiRequestError).name).toBe('ApiRequestError');
  });

  it('usa message quando não há erros', async () => {
    installFetchMock([
      { match: '/usuario/perfil', status: 500, body: { message: 'Erro interno' } },
    ]);

    await expect(getUserProfile('tk')).rejects.toThrow('Erro interno');
  });

  it('usa mensagem padrão quando o corpo é inválido', async () => {
    installFetchMock([{ match: '/usuario/perfil', status: 500, invalidJson: true }]);

    await expect(getUserProfile('tk')).rejects.toThrow(
      'Não foi possível carregar os dados do usuário.'
    );
  });
});

describe('updateUserProfile', () => {
  it('atualiza o perfil', async () => {
    installFetchMock([
      { match: '/usuario/perfil', body: { success: true, data: { ...PERFIL, nome: 'Bia' } } },
    ]);

    const perfil = await updateUserProfile('tk', {
      nome: 'Bia',
      sobrenome: 'Silva',
      email: 'b@b.c',
      documento: '1',
      telefone: '11988776655',
      tipoPessoa: 'CPF',
    });

    expect(perfil.nome).toBe('Bia');
  });

  it('usa primeiro erro da API', async () => {
    installFetchMock([
      { match: '/usuario/perfil', status: 422, body: { erros: ['E-mail em uso'] } },
    ]);

    await expect(
      updateUserProfile('tk', { telefone: '11988776655' })
    ).rejects.toThrow('E-mail em uso');
  });

  it('usa message da API', async () => {
    installFetchMock([{ match: '/usuario/perfil', status: 400, body: { message: 'Inválido' } }]);

    await expect(updateUserProfile('tk', { telefone: '1' })).rejects.toThrow('Inválido');
  });

  it('usa mensagem padrão quando falha', async () => {
    installFetchMock([{ match: '/usuario/perfil', status: 500, body: {} }]);

    await expect(updateUserProfile('tk', { telefone: '1' })).rejects.toThrow(
      'Não foi possível atualizar o perfil.'
    );
  });
});

describe('getAddressByCep', () => {
  it('sem token lança sessão expirada', async () => {
    const fetchMock = installFetchMock([]);

    await expect(getAddressByCep('01000-000')).rejects.toThrow(
      'Sessão expirada. Entre novamente.'
    );
    expect(fetchMock.calls).toHaveLength(0);
    fetchMock.restore();
  });

  it('com token expirado lança sessão expirada', async () => {
    seedStoredToken(expiredToken());

    await expect(getAddressByCep('01000000')).rejects.toThrow(
      'Sessão expirada. Entre novamente.'
    );
  });

  it('normaliza o CEP e retorna o endereço', async () => {
    seedStoredToken(validToken({ accessToken: 'tk-cep' }));
    const fetchMock = installFetchMock([
      {
        match: '/enderecos/cep/',
        body: {
          success: true,
          data: { cep: '01000-000', rua: 'Praça da Sé', bairro: 'Sé', cidade: 'SP', estado: 'SP' },
        },
      },
    ]);

    const endereco = await getAddressByCep('01000-000');

    expect(endereco.rua).toBe('Praça da Sé');
    expect(fetchMock.calls[0].url).toContain('/enderecos/cep/01000000');
    fetchMock.restore();
  });

  it('propaga erros da API', async () => {
    seedStoredToken(validToken());
    installFetchMock([{ match: '/enderecos/cep/', status: 404, body: { erros: ['CEP não encontrado'] } }]);

    await expect(getAddressByCep('99999999')).rejects.toThrow('CEP não encontrado');
  });

  it('usa message da API', async () => {
    seedStoredToken(validToken());
    installFetchMock([{ match: '/enderecos/cep/', status: 500, body: { message: 'Falhou' } }]);

    await expect(getAddressByCep('99999999')).rejects.toThrow('Falhou');
  });

  it('usa mensagem padrão sem corpo', async () => {
    seedStoredToken(validToken());
    installFetchMock([{ match: '/enderecos/cep/', status: 500, body: {} }]);

    await expect(getAddressByCep('99999999')).rejects.toThrow(
      'Não foi possível consultar o CEP.'
    );
  });
});

describe('updateUserAddress', () => {
  it('salva o endereço', async () => {
    installFetchMock([
      { match: '/usuario/perfil', body: { success: true, data: PERFIL } },
    ]);

    const perfil = await updateUserAddress('tk', { ...PERFIL.endereco });

    expect(perfil.endereco.cidade).toBe('São Paulo');
  });

  it('usa primeiro erro da API', async () => {
    installFetchMock([
      { match: '/usuario/perfil', status: 400, body: { erros: ['Endereço inválido'] } },
    ]);

    await expect(updateUserAddress('tk', { ...PERFIL.endereco })).rejects.toThrow(
      'Endereço inválido'
    );
  });

  it('usa message da API', async () => {
    installFetchMock([{ match: '/usuario/perfil', status: 400, body: { message: 'Sem acesso' } }]);

    await expect(updateUserAddress('tk', { ...PERFIL.endereco })).rejects.toThrow('Sem acesso');
  });

  it('usa mensagem padrão', async () => {
    installFetchMock([{ match: '/usuario/perfil', status: 500, body: {} }]);

    await expect(updateUserAddress('tk', { ...PERFIL.endereco })).rejects.toThrow(
      'Não foi possível salvar o endereço.'
    );
  });
});

describe('uploadUserProfilePhoto', () => {
  const foto = { uri: 'file:///fotos/perfil.jpg', contentType: 'image/jpeg' as const, size: 1024 };

  it('faz authorize → upload → confirm com sucesso', async () => {
    const fetchMock = installFetchMock([
      { match: '/upload-url', body: { success: true, data: { uploadUrl: 'https://storage.test/u', objectKey: 'obj-1', expiresAt: 'x' } } },
      { match: 'file:///fotos/', status: 200, body: {} },
      { match: 'https://storage.test/u', status: 200, body: {} },
      { match: '/usuario/perfil/foto', body: { success: true, data: PERFIL } },
    ]);

    const perfil = await uploadUserProfilePhoto('tk', foto);

    expect(perfil).toEqual(PERFIL);
    expect(fetchMock.calls).toHaveLength(4);
    fetchMock.restore();
  });

  it('falha na autorização usa erros', async () => {
    installFetchMock([
      { match: '/upload-url', status: 403, body: { erros: ['Sem permissão'] } },
    ]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow('Sem permissão');
  });

  it('falha na autorização usa message', async () => {
    installFetchMock([{ match: '/upload-url', status: 400, body: { message: 'Arquivo grande' } }]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow('Arquivo grande');
  });

  it('falha na autorização usa mensagem padrão', async () => {
    installFetchMock([{ match: '/upload-url', status: 500, body: {} }]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow(
      'Não foi possível preparar o envio da foto.'
    );
  });

  it('falha no upload para o storage', async () => {
    installFetchMock([
      { match: '/upload-url', body: { success: true, data: { uploadUrl: 'https://storage.test/u', objectKey: 'k', expiresAt: 'x' } } },
      { match: 'file:///fotos/', status: 200, body: {} },
      { match: 'https://storage.test/u', status: 500, body: {} },
    ]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow(
      'Não foi possível enviar a foto para o armazenamento.'
    );
  });

  it('falha na confirmação usa erros', async () => {
    installFetchMock([
      { match: '/upload-url', body: { success: true, data: { uploadUrl: 'https://storage.test/u', objectKey: 'k', expiresAt: 'x' } } },
      { match: 'file:///fotos/', status: 200, body: {} },
      { match: 'https://storage.test/u', status: 200, body: {} },
      { match: '/usuario/perfil/foto', status: 409, body: { erros: ['Conflito'] } },
    ]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow('Conflito');
  });

  it('falha na confirmação usa message', async () => {
    installFetchMock([
      { match: '/upload-url', body: { success: true, data: { uploadUrl: 'https://storage.test/u', objectKey: 'k', expiresAt: 'x' } } },
      { match: 'file:///fotos/', status: 200, body: {} },
      { match: 'https://storage.test/u', status: 200, body: {} },
      { match: '/usuario/perfil/foto', status: 400, body: { message: 'Chave inválida' } },
    ]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow('Chave inválida');
  });

  it('falha na confirmação usa mensagem padrão', async () => {
    installFetchMock([
      { match: '/upload-url', body: { success: true, data: { uploadUrl: 'https://storage.test/u', objectKey: 'k', expiresAt: 'x' } } },
      { match: 'file:///fotos/', status: 200, body: {} },
      { match: 'https://storage.test/u', status: 200, body: {} },
      { match: '/usuario/perfil/foto', status: 500, body: {} },
    ]);

    await expect(uploadUserProfilePhoto('tk', foto)).rejects.toThrow(
      'A foto foi enviada, mas não foi possível atualizar o perfil.'
    );
  });
});

describe('removeUserProfilePhoto', () => {
  it('remove a foto', async () => {
    installFetchMock([{ match: '/usuario/perfil/foto', body: { success: true, data: PERFIL } }]);

    const perfil = await removeUserProfilePhoto('tk');
    expect(perfil.id).toBe(1);
  });

  it('usa erros da API', async () => {
    installFetchMock([
      { match: '/usuario/perfil/foto', status: 404, body: { erros: ['Sem foto'] } },
    ]);

    await expect(removeUserProfilePhoto('tk')).rejects.toThrow('Sem foto');
  });

  it('usa message da API', async () => {
    installFetchMock([
      { match: '/usuario/perfil/foto', status: 400, body: { message: 'Não permitido' } },
    ]);

    await expect(removeUserProfilePhoto('tk')).rejects.toThrow('Não permitido');
  });

  it('usa mensagem padrão', async () => {
    installFetchMock([{ match: '/usuario/perfil/foto', status: 500, body: {} }]);

    await expect(removeUserProfilePhoto('tk')).rejects.toThrow(
      'Não foi possível remover a foto de perfil.'
    );
  });
});
