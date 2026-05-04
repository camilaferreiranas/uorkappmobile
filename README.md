# Uork - Plataforma Mobile para Conexão de Profissionais e Clientes

Uork é um aplicativo móvel desenvolvido com React Native e Expo, projetado para conectar profissionais de diversos serviços com clientes que precisam de suas habilidades. A plataforma permite que usuários publiquem demandas, busquem profissionais, façam propostas, avaliem serviços e gerenciem perfis profissionais.

## Funcionalidades Principais

### Para Clientes:
- **Publicar Demandas**: Crie e publique solicitações de serviços com detalhes específicos.
- **Buscar Profissionais**: Explore categorias de profissionais e encontre o ideal para suas necessidades.
- **Enviar Propostas**: Contate profissionais diretamente através do app.
- **Avaliar Serviços**: Deixe reviews e classificações para profissionais após o serviço.
- **Gerenciar Perfil**: Atualize suas informações pessoais e histórico de demandas.

### Para Profissionais:
- **Perfil Profissional**: Crie e gerencie seu perfil com especialidades, experiência e portfólio.
- **Receber Demandas**: Visualize e responda a solicitações de clientes em sua área.
- **Enviar Propostas**: Ofereça seus serviços com preços e condições personalizadas.
- **Relatórios**: Acesse métricas sobre seus serviços e avaliações.
- **Navegação Especializada**: Interface otimizada para profissionais com ferramentas dedicadas.

### Recursos Gerais:
- **Autenticação Segura**: Login, cadastro e recuperação de senha.
- **Navegação Intuitiva**: Interface baseada em abas com navegação fluida.
- **Suporte Multiplataforma**: Compatível com iOS, Android e Web.
- **Experiência Personalizada**: Design responsivo com suporte a modo escuro.

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile cross-platform.
- **Expo**: Plataforma para desenvolvimento, build e deploy de apps React Native.
- **Expo Router**: Sistema de roteamento baseado em arquivos para navegação.
- **TypeScript**: Tipagem estática para maior robustez do código.
- **React Navigation**: Biblioteca para navegação entre telas.
- **Expo Vector Icons**: Conjunto de ícones vetoriais.
- **Outros**: Expo Image, Expo Haptics, React Native Reanimated, etc.

## Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Para desenvolvimento mobile: Expo Go app ou emuladores/simuladores

### Passos de Instalação

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd uorkappmobile
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npx expo start
   ```

4. **Execute o app**:
   - **Expo Go**: Escaneie o QR code com o app Expo Go no seu dispositivo.
   - **Emulador Android**: Pressione `a` no terminal.
   - **Simulador iOS**: Pressione `i` no terminal (macOS apenas).
   - **Web**: Pressione `w` no terminal.

### Scripts Disponíveis

- `npm start`: Inicia o servidor Expo.
- `npm run android`: Inicia especificamente para Android.
- `npm run ios`: Inicia especificamente para iOS.
- `npm run web`: Inicia especificamente para web.
- `npm run lint`: Executa o linter para verificar código.
- `npm run reset-project`: Reseta o projeto para um estado inicial (move código para app-example).

## Estrutura do Projeto

```
uorkappmobile/
├── app/                    # Telas e roteamento (Expo Router)
│   ├── _layout.tsx        # Layout principal
│   ├── index.tsx          # Tela inicial
│   ├── (tabs)/            # Navegação por abas
│   │   ├── home/          # Tela inicial do usuário
│   │   ├── explore/       # Exploração de serviços
│   │   ├── perfil/        # Perfil do usuário
│   │   └── publicar/      # Publicar demanda
│   └── ...                # Outras telas (login, signup, etc.)
├── components/            # Componentes reutilizáveis
│   ├── ui/                # Componentes de UI
│   └── ...                # Outros componentes
├── constants/             # Constantes (temas, etc.)
├── hooks/                 # Hooks customizados
├── services/              # Serviços (API, etc.)
├── assets/                # Imagens e recursos
└── ...                    # Arquivos de configuração
```

## Desenvolvimento

### Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenções de Código

- Use TypeScript para tipagem
- Siga as regras do ESLint configurado
- Mantenha a estrutura de pastas organizada
- Documente componentes e funções importantes

## Suporte e Contato

Para dúvidas, sugestões ou problemas, entre em contato através do [GitHub Issues](https://github.com/seu-usuario/uorkappmobile/issues).

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido com ❤️ usando Expo e React Native.
