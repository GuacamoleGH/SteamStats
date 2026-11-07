// =============================================================================
// SteamStats — Scheduled Background Worker
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import cron from 'node-cron';

console.log('[Worker] SteamStats Background Worker iniciado.');

// Tarea diaria a medianoche (00:00 UTC) para snapshots de horas
cron.schedule('0 0 * * *', () => {
  console.log('[Worker] Ejecutando tarea programada: Snapshot diario de horas de juego...');
});

// Mantener proceso activo
process.on('SIGTERM', () => {
  console.log('[Worker] Señal SIGTERM recibida. Cerrando worker limpiamente.');
  process.exit(0);
});
