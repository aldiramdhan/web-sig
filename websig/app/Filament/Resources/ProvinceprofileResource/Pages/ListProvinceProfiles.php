<?php

namespace App\Filament\Resources\ProvinceProfileResource\Pages;

use App\Filament\Resources\ProvinceProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProvinceProfiles extends ListRecords
{
    protected static string $resource = ProvinceProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
