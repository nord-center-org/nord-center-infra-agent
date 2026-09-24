# Ferramentas de CI

Implementadas: `get_workflow` lista execuções e `get_logs` lê os arquivos de log de uma execução GitHub Actions. Ambas são somente leitura, recebem `project` e aplicam limites de volume. Disparar workflows ou alterar configurações de CI não está exposto.
