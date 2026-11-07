// =============================================================================
// SteamStats — Scheduled Background Worker
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Worker en segundo plano que programa y ejecuta la captura de
 * snapshots de tiempo de juego diario con node-cron.
 * @spec REQ-08, RNF-01
 */

import cron from 'node-cron';
import { captureSnapshotsForAllProfiles } from './snapshot';

console.log('[Worker] SteamStats Background Worker iniciado.');

// Si se pasa el argumento --now, ejecutar inmediatamente
if (process.argv.includes('--now')) {
  console.log('[Worker] Flag --now detectado. Ejecutando captura inmediata...');
  captureSnapshotsForAllProfiles()
    .then(() => {
      console.log('[Worker] Tarea manual completada.');
      if (process.argv.includes('--exit')) {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[Worker] Error en ejecución manual:', err);
      process.exit(1);
    });
}

// Tarea diaria a medianoche (00:00 UTC) para snapshots de horas
cron.schedule('0 0 * * *', async () => {
  console.log('[Worker] Cron disparado: Iniciando snapshot diario de horas de juego...');
  try {
    await captureSnapshotsForAllProfiles();
  } catch (err) {
    console.error('[Worker] Error en tarea programada:', err);
  }
});

console.log('[Worker] Cron programado a las 00:00 UTC diariamente.');

// Cierre limpio de procesos
process.on('SIGTERM', () => {
  console.log('[Worker] Señal SIGTERM recibida. Cerrando worker limpiamente.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Worker] Señal SIGINT recibida. Cerrando worker limpiamente.');
  process.exit(0);
});
