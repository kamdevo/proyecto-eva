<?php

namespace App\Console\Commands;

use App\Support\TextSanitizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Limpia el HTML basura que quedó guardado en las descripciones de tickets.
 *
 * Origen del problema: el editor de descripción no filtraba el pegado, así que
 * al copiar desde Gmail/Word entraba el HTML de origen completo (style,
 * font-family, &quot;...). Ya está corregido en el editor y en el backend;
 * este comando repara los registros anteriores.
 *
 * Uso:
 *   php artisan tickets:limpiar-html            # simulación (no escribe nada)
 *   php artisan tickets:limpiar-html --apply    # aplica los cambios
 */
class LimpiarHtmlDescripciones extends Command
{
    protected $signature = 'tickets:limpiar-html
                            {--apply : Aplica los cambios (sin esta opción solo simula)}
                            {--limit=0 : Procesar como máximo N registros (0 = todos)}';

    protected $description = 'Limpia etiquetas HTML pegadas en ordenes.descripcion';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $limit = (int) $this->option('limit');

        $this->info($apply
            ? '>> MODO APLICAR: se guardarán los cambios.'
            : '>> MODO SIMULACIÓN: no se escribirá nada. Use --apply para guardar.');

        $query = DB::table('ordenes')
            ->select('id', 'descripcion')
            ->whereNotNull('descripcion')
            ->where('descripcion', '<>', '');

        $revisados = 0;
        $sucios    = 0;
        $vacios    = 0;
        $muestras  = [];

        $query->orderBy('id')->chunkById(500, function ($filas) use (
            $apply, $limit, &$revisados, &$sucios, &$vacios, &$muestras
        ) {
            foreach ($filas as $fila) {
                if ($limit > 0 && $revisados >= $limit) {
                    return false;
                }
                $revisados++;

                $original = (string) $fila->descripcion;
                if (! TextSanitizer::looksLikeHtml($original)) {
                    continue;
                }

                $limpio = TextSanitizer::sanitizeRich($original);
                if ($limpio === $original) {
                    continue;
                }

                // Salvaguarda: si el saneado deja el campo vacío, no se toca.
                // Mejor conservar el original que perder la descripción.
                if (trim(strip_tags($limpio)) === '') {
                    $vacios++;
                    continue;
                }

                $sucios++;
                if (count($muestras) < 5) {
                    $muestras[] = [
                        $fila->id,
                        mb_substr(preg_replace('/\s+/', ' ', $original), 0, 60),
                        mb_substr(preg_replace('/\s+/', ' ', $limpio), 0, 60),
                    ];
                }

                if ($apply) {
                    DB::table('ordenes')->where('id', $fila->id)->update(['descripcion' => $limpio]);
                }
            }
        });

        if ($muestras) {
            $this->newLine();
            $this->table(['ID', 'Antes', 'Después'], $muestras);
        }

        $this->newLine();
        $this->line("Registros revisados : {$revisados}");
        $this->line("Con HTML a limpiar  : {$sucios}");
        if ($vacios > 0) {
            $this->warn("Omitidos (quedarían vacíos, se conservan tal cual): {$vacios}");
        }

        if (! $apply && $sucios > 0) {
            $this->newLine();
            $this->comment('Nada se modificó. Para aplicarlo: php artisan tickets:limpiar-html --apply');
        }
        if ($apply) {
            $this->info(">> Listo. {$sucios} descripciones limpiadas.");
        }

        return self::SUCCESS;
    }
}
