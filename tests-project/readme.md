## Alyra - Formation developeur blockchain - Projet 2 : tests

L'ensemble des tests se situent dans le fichier test/test.js.
Les tests prennent en compte l'ensemble du processus de voting, incluant :
    - l'inscription des voteurs
    - l'ajout de propositions
    - la session de vote
    - le resultat des votes et la proposition gagnante

Ils examinent aussi bien les resultats des fonctions, les exceptions levée par les requires ou les les events emis.

TODO:
    - Test de l'ordre des changements de status du workflow 
    - Test des changements de status par un autre que le owner
    - Test d'accès au getter avec un autre que le owner oou des voters 
    - Coverage
