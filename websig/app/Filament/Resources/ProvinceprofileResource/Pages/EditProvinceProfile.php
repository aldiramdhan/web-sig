<?php

namespace App\Filament\Resources\ProvinceProfileResource\Pages;

use App\Filament\Resources\ProvinceProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProvinceProfile extends EditRecord
{
    protected static string $resource = ProvinceProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
