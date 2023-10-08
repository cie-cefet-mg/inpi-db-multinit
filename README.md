# INPI Database

Os dados podem ser encontrados em:

-   `data/processos`: Arquivos de cada processo.
-   `data/revistas`: Arquivos comprimidos e processados de cada revista utilizada.
-   `data/dicionario-dados.pdf`: Dicionário de dados explicando o que cada campo significa nos JSON's dos processos

## Pré-requisitos

- Node.js >=18
- [pnpm](https://pnpm.io/pt/installation)

## Ínicio Rápido
1. Instale as dependências:
```
pnpm install
```
2. Execute o pipeline:

Primeiro, baixe as revistas faltantes:
```
npm run download
```
Em seguida, transforme as revistas em JSON para facilitar a extração dos dados:
```
npm run parse
```
Por fim, explore os dados visando encontrar novos processos:
```
npm run explore
```

## Adicionando novas seções
O arquivo [src/sections.ts](https://github.com/cie-cefet-mg/inpi-db/blob/main/src/sections.ts), exporta as seções que serão baixadas e exploradas. O array exportado é de objetos que seguem a interface "Seção". Os passos para integrar com uma nova seção são os seguintes.
1. Crie na pasta [src/models/sections](https://github.com/cie-cefet-mg/inpi-db/tree/main/src/models/sections), uma classe que `extends` a classe abstrada `Section`. Exemplo:
```ts
import { Section } from "./section";
import path from "path";

export class SectionSoftware extends Section {
    constructor() {
        super("PC", "programa-computador");
    }

    parse(value: { [key: string]: any }): { [key: string]: any } | null {
        return null;
    }

    explore(jsonPath: string): void {
        console.log(jsonPath);
        return;
    }
}
```
Veja que:
- É importante definir para a classe super, qual a sigla utilizada no INPI para a seção (PC, para programas de computador) e um identificador que será usado para criar a pasta de revistas e processos.
- Ao estender, é necessário implementar dois métodos: `parse` e `explore`. O pipeline é composto pelas etapas de `download`, `parse` e `explore`.
    - O método `download` não precisa ser implementado, pois basta saber que a sigla para a seção é `PC` que o código na classe abstrada `Section` fará o download de todas as revistas.
    - O método `parse`, recebe o objeto representando a tentativa do método `xml2js` de fazer o parse de XML para JSON da revista baixada. Normalmente, a estrutura dessa tentativa é muito incoveniente, porque ele assume que quase todos os campos são arrays. Então, o método `parse` é uma oportunidade que existe para deixar o objeto do jeito ideal para ser explorado. Um bom exemplo de como escrever o método `parse` é o utilizado nas patentes. Crie um `parser` na pasta [src/parsers](https://github.com/cie-cefet-mg/inpi-db/tree/main/src/parsers), que recebe a estrutura enviada para o `parse` e retorna um objeto tratado com a estrutura que você deseja.
    - O método `explore` é chamado para cada revista nova. O método recebe o caminho até o json salvo após o `parse` (`jsonPath`) e a ideia é abrir essa revista e explorar o conteúdo, salvando novas informações em processos já existentes e criando os arquivos para novos processos. Use de exemplo o método explore do `SectionPatent`.
