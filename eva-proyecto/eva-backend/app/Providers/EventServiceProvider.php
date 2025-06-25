<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        // Laravel default events
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Equipment Events
        \App\Events\Equipment\EquipmentCreated::class => [
            \App\Listeners\EquipmentListener::class . '@handleEquipmentCreated',
            \App\Listeners\SystemEventListener::class,
        ],
        \App\Events\Equipment\EquipmentUpdated::class => [
            \App\Listeners\EquipmentListener::class . '@handleEquipmentUpdated',
            \App\Listeners\SystemEventListener::class,
        ],
        \App\Events\Equipment\EquipmentDeleted::class => [
            \App\Listeners\EquipmentListener::class . '@handleEquipmentDeleted',
            \App\Listeners\SystemEventListener::class,
        ],
        \App\Events\EquipmentStatusChanged::class => [
            \App\Listeners\EquipmentEventListener::class,
            \App\Listeners\SystemEventListener::class,
        ],

        // Maintenance Events
        \App\Events\Maintenance\MaintenanceScheduled::class => [
            \App\Listeners\MaintenanceListener::class . '@handleMaintenanceScheduled',
            \App\Listeners\SystemEventListener::class,
        ],
        \App\Events\Maintenance\MaintenanceCompleted::class => [
            \App\Listeners\MaintenanceListener::class . '@handleMaintenanceCompleted',
            \App\Listeners\SystemEventListener::class,
        ],

        // Contingency Events
        \App\Events\Contingency\ContingencyCreated::class => [
            \App\Listeners\ContingencyListener::class . '@handleContingencyCreated',
            \App\Listeners\SystemEventListener::class,
        ],

        // Calibration Events
        \App\Events\Calibration\CalibrationScheduled::class => [
            \App\Listeners\CalibrationListener::class . '@handleCalibrationScheduled',
            \App\Listeners\SystemEventListener::class,
        ],

        // Training Events
        \App\Events\Training\TrainingScheduled::class => [
            \App\Listeners\TrainingListener::class . '@handleTrainingScheduled',
            \App\Listeners\SystemEventListener::class,
        ],

        // File Events
        \App\Events\File\FileUploaded::class => [
            \App\Listeners\FileListener::class . '@handleFileUploaded',
            \App\Listeners\SystemEventListener::class,
        ],

        // User Events
        \App\Events\User\UserLoggedIn::class => [
            \App\Listeners\UserListener::class . '@handleUserLoggedIn',
            \App\Listeners\SystemEventListener::class,
        ],

        // Dashboard Events
        \App\Events\Dashboard\DashboardDataUpdated::class => [
            \App\Listeners\DashboardListener::class . '@handleDashboardDataUpdated',
        ],

        // System Events
        'eloquent.created: App\Models\Equipo' => [
            \App\Listeners\ModelEventListener::class . '@handleEquipmentCreated',
        ],
        'eloquent.updated: App\Models\Equipo' => [
            \App\Listeners\ModelEventListener::class . '@handleEquipmentUpdated',
        ],
        'eloquent.deleted: App\Models\Equipo' => [
            \App\Listeners\ModelEventListener::class . '@handleEquipmentDeleted',
        ],
        'eloquent.created: App\Models\Mantenimiento' => [
            \App\Listeners\ModelEventListener::class . '@handleMaintenanceCreated',
        ],
        'eloquent.updated: App\Models\Mantenimiento' => [
            \App\Listeners\ModelEventListener::class . '@handleMaintenanceUpdated',
        ],
        'eloquent.created: App\Models\Contingencia' => [
            \App\Listeners\ModelEventListener::class . '@handleContingencyCreated',
        ],
        'eloquent.created: App\Models\Calibracion' => [
            \App\Listeners\ModelEventListener::class . '@handleCalibrationCreated',
        ],
        'eloquent.created: App\Models\Capacitacion' => [
            \App\Listeners\ModelEventListener::class . '@handleTrainingCreated',
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();

        // Register wildcard listeners for all events
        Event::listen('App\Events\*', function ($eventName, array $data) {
            \Log::channel('audit')->info('Event fired', [
                'event' => $eventName,
                'timestamp' => now()->toISOString(),
                'data_count' => count($data),
            ]);
        });

        // Register security event listeners
        Event::listen('auth.login', function ($user) {
            event(new \App\Events\User\UserLoggedIn($user, [
                'login_time' => now(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]));
        });

        // Register model observers for automatic event firing
        $this->registerModelObservers();

        // Register queue event listeners
        $this->registerQueueEventListeners();

        // Register broadcasting event listeners
        $this->registerBroadcastingEventListeners();
    }

    /**
     * Register model observers.
     */
    protected function registerModelObservers(): void
    {
        // Equipment observer
        \App\Models\Equipo::observe(\App\Observers\EquipmentObserver::class);
        
        // Maintenance observer
        \App\Models\Mantenimiento::observe(\App\Observers\MaintenanceObserver::class);
        
        // Contingency observer
        \App\Models\Contingencia::observe(\App\Observers\ContingencyObserver::class);
        
        // User observer
        \App\Models\User::observe(\App\Observers\UserObserver::class);
    }

    /**
     * Register queue event listeners.
     */
    protected function registerQueueEventListeners(): void
    {
        // Listen for job processing events
        Event::listen('queue.job.processing', function ($event) {
            \Log::channel('performance')->info('Job processing started', [
                'job' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'started_at' => now()->toISOString(),
            ]);
        });

        Event::listen('queue.job.processed', function ($event) {
            \Log::channel('performance')->info('Job processing completed', [
                'job' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'completed_at' => now()->toISOString(),
            ]);
        });

        Event::listen('queue.job.failed', function ($event) {
            \Log::channel('performance')->error('Job processing failed', [
                'job' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'exception' => $event->exception->getMessage(),
                'failed_at' => now()->toISOString(),
            ]);
        });
    }

    /**
     * Register broadcasting event listeners.
     */
    protected function registerBroadcastingEventListeners(): void
    {
        // Listen for broadcasting events
        Event::listen('broadcasting.event', function ($event) {
            \Log::channel('audit')->info('Event broadcasted', [
                'event' => get_class($event),
                'channels' => $event->broadcastOn(),
                'broadcasted_at' => now()->toISOString(),
            ]);
        });
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
