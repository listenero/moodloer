# Automação Moodle

Suponho que quando as notas forem inputadas, algum dos três eventos ocorrerá:

1 - O link (url) do arquivo notas P1 será alterado
2 - O texto do item/link será alterado
3 - O link e texto permanecerão iguais mas o arquivo terá conteúdo diferente (MD5)

Uma exceção com texto personalizado para cada será lançada, e o tratamento fica a critério do usuário, implementando a função 'notasChanged'.
Deixei pra tocar um som como default.
## Configuração
1. Clone o repositório para sua máquina local.
2. Instale as dependências do projeto usando:
   ```bash
   npm install