<?php

namespace App\Traits;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

trait ValidatesData
{
    /**
     * Validate data against rules.
     */
    public function validateData(array $data, array $rules, array $messages = []): array
    {
        $validator = Validator::make($data, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Validate and sanitize input data.
     */
    public function validateAndSanitize(array $data, array $rules, array $messages = []): array
    {
        $validated = $this->validateData($data, $rules, $messages);
        return $this->sanitizeData($validated);
    }

    /**
     * Sanitize data.
     */
    protected function sanitizeData(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Remove potentially dangerous characters
                $data[$key] = strip_tags(trim($value));
                
                // Additional sanitization for specific fields
                if (in_array($key, ['email'])) {
                    $data[$key] = filter_var($value, FILTER_SANITIZE_EMAIL);
                }
                
                if (in_array($key, ['url', 'website'])) {
                    $data[$key] = filter_var($value, FILTER_SANITIZE_URL);
                }
            }
        }

        return $data;
    }

    /**
     * Get validation rules for creating.
     */
    public function getCreateRules(): array
    {
        return $this->rules ?? [];
    }

    /**
     * Get validation rules for updating.
     */
    public function getUpdateRules(): array
    {
        $rules = $this->getCreateRules();
        
        // Make some fields optional for updates
        foreach ($rules as $field => $rule) {
            if (is_string($rule) && str_contains($rule, 'required')) {
                $rules[$field] = str_replace('required', 'sometimes|required', $rule);
            }
        }

        return $rules;
    }

    /**
     * Get custom validation messages.
     */
    public function getValidationMessages(): array
    {
        return $this->messages ?? [];
    }

    /**
     * Validate before saving.
     */
    public function validateBeforeSave(array $data = null): void
    {
        $data = $data ?? $this->getAttributes();
        $rules = $this->exists ? $this->getUpdateRules() : $this->getCreateRules();
        
        $this->validateData($data, $rules, $this->getValidationMessages());
    }

    /**
     * Safe mass assignment with validation.
     */
    public function safeFill(array $data): self
    {
        $validated = $this->validateAndSanitize(
            $data,
            $this->getCreateRules(),
            $this->getValidationMessages()
        );

        return $this->fill($validated);
    }

    /**
     * Safe update with validation.
     */
    public function safeUpdate(array $data): bool
    {
        $validated = $this->validateAndSanitize(
            $data,
            $this->getUpdateRules(),
            $this->getValidationMessages()
        );

        return $this->update($validated);
    }
}
