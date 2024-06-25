# Automação Moodle

Quando o professor postar a nota, acredito que um dos seguintes ocorrerá:

1. **Mudança na URL do arquivo:** A URL do arquivo de notas (P1) é alterada. Uma exceção com uma mensagem personalizada será lançada.  
2. **Mudança no texto do link:** O texto associado ao link das notas é alterado. Uma exceção com uma mensagem personalizada será lançada.  
3. **Mudança no conteúdo do arquivo:** O link e o texto permanecem os mesmos, mas o conteúdo do arquivo é diferente (verificação via MD5). Uma exceção com uma mensagem personalizada será lançada.  
  

Em qualquer dos casos, a função `notasChanged` será chamada, e o tratamento das exceções **fica a critério do usuário**.
Por padrão, um som será reproduzido.  

  
## Configuração  

Para configurar e executar este projeto, siga os passos abaixo para clonar, instalar as dependências, compilar e rodar:

1. **Passos:**
    Alterar os parâmetros e incluir usuário e senha no arquivo 'run.ts'
   ```bash
   git clone https://github.com/listenero/moodloer.git
   cd moodloer
   npm install
   npx tsc
   node .\run.js
