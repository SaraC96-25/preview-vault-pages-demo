# Preview Vault Demo

Demo statica pensata per GitHub Pages.

## Cosa include

- area admin con form per creare una preview
- upload ZIP frontend e ricerca automatica di `index.html`
- link con slug personalizzato
- password lato client
- viewer con preset desktop, tablet e mobile
- progetto demo seedato per mostrare subito il flusso

## Limite importante

Questa versione gira senza backend, quindi i progetti caricati vengono salvati nel browser locale tramite IndexedDB.

Questo significa che:

- la UI e il flusso sono reali
- la preview demo seedata e pubblica funziona subito
- le nuove preview create dall'admin non sono condivise veramente con altri dispositivi

Per una versione produzione servono:

- storage remoto
- autenticazione server-side
- endpoint per creare link protetti

Una buona evoluzione e collegare la stessa UI a Supabase oppure a Cloudflare R2 + funzioni edge.
