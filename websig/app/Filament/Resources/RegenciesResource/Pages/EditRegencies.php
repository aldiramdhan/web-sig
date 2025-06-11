<?php

namespace App\Filament\Resources\RegenciesResource\Pages;

use App\Filament\Resources\RegenciesResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRegencies extends EditRecord
{
    protected static string $resource = RegenciesResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
