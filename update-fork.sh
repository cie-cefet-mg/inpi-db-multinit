#!/bin/bash
# Adicione um novo remote; pode chamá-lo de "upstream":

git remote set-url origin https://github.com/cie-cefet-mg/inpi-db.git

# Obtenha todos os branches deste novo remote,
# como o upstream/main por exemplo:

git fetch upstream

# Certifique-se de que você está no branch main:

git checkout main

# Reescreva o seu branch main, de forma que os seus commits
# que não estão no projeto original apareçam, e que os seus
# commits fiquem no topo da lista:

#git rebase upstream/main

# Se você não quiser reescrever o histórico do seu branch main
# (talvez porque alguém já o tenha clonado) então você deve
# substituir o último comando por um

git merge upstream/main

# No entanto, para fazer com que futuros pull requests fiquem o mais
# limpos possível, é uma boa ideia fazer o rebase.

# Se você fez o rebase do seu branch a partir de upstream/main, talvez
# você precise forçar um push para o seu próprio repositório do Github.
# Você pode fazer isso com:

# git push -f origin main

# VocÊ vai precisar fazer isso com o -f apenas na primeira vez que você
# faz um rebase.