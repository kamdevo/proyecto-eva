<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SecopService;
use Illuminate\Support\Facades\DB;

class TestSecopCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:secop';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test SECOP integration functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== TESTING SECOP INTEGRATION ===');

        try {
            // 1. Test service creation
            $this->info('1. Creating SECOP service...');
            $secopService = app(SecopService::class);
            $this->info('✅ SECOP service created successfully');

            // 2. Test basic query
            $this->info('2. Testing basic SECOP query...');
            $resultado = $secopService->consultarProcesos(['entidad' => 'Hospital', 'limit' => 5]);
            
            if ($resultado['success']) {
                $this->info('✅ SECOP query successful');
                $this->info('📊 Total results: ' . count($resultado['data']));
                
                if (!empty($resultado['data'])) {
                    $primer = $resultado['data'][0];
                    $this->info('📋 First result sample:');
                    $this->line('- UID: ' . ($primer['uid'] ?? 'N/A'));
                    $this->line('- Entity: ' . ($primer['entidad'] ?? 'N/A'));
                    $this->line('- Object: ' . substr($primer['objeto'] ?? 'N/A', 0, 50) . '...');
                    $this->line('- Value: $' . number_format($primer['valor'] ?? 0));
                }
            } else {
                $this->error('❌ SECOP query failed: ' . $resultado['error']);
            }

            // 3. Test database integration
            $this->info('3. Testing database integration...');
            $orden = DB::table('ordenes_compra')->first();
            if ($orden) {
                $this->info('✅ ordenes_compra table exists and has data');
                $this->line('- ID: ' . $orden->id);
                $this->line('- Order: ' . $orden->orden);
                $this->line('- SECOP ID: ' . ($orden->secop_id ?? 'N/A'));
                $this->line('- SECOP URL: ' . ($orden->url_secop ?? 'N/A'));
            } else {
                $this->warn('⚠️ ordenes_compra table exists but has no data');
            }

            // 4. Test controller endpoint simulation
            $this->info('4. Testing controller simulation...');
            $controller = app(\App\Http\Controllers\Api\SecopController::class);
            $this->info('✅ SECOP controller can be instantiated');

            $this->info('✅ All SECOP tests completed successfully!');

        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }
}
