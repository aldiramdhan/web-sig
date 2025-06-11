<?php

namespace App\Filament\Resources\RegenciesResource\Pages;

use App\Filament\Resources\RegenciesResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRegencies extends ListRecords
{
    protected static string $resource = RegenciesResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
