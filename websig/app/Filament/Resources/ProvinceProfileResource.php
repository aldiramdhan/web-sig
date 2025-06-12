<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProvinceProfileResource\Pages;
use App\Filament\Resources\ProvinceProfileResource\RelationManagers;
use App\Models\Province_profile;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProvinceProfileResource extends Resource
{
    protected static ?string $model = Province_profile::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('province_id')
                    ->label('Province')
                    ->relationship('province', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('population')
                    ->label('Population')
                    ->required()
                    ->numeric()
                    ->minValue(0),

                Forms\Components\TextInput::make('year')
                    ->label('Year')
                    ->required()
                    ->integer()
                    ->minValue(1900)
                    ->maxValue(2100),

                Forms\Components\TextInput::make('gdp')
                    ->label('GDP')
                    ->required()
                    ->numeric()
                    ->minValue(0),

                Forms\Components\TextInput::make('total_sd')
                    ->label('Total SD')
                    ->required()
                    ->numeric()
                    ->minValue(0),

                Forms\Components\TextInput::make('total_smp')
                    ->label('Total SMP')
                    ->required()
                    ->numeric()
                    ->minValue(0),

                Forms\Components\TextInput::make('total_sma')
                    ->label('Total SMA')
                    ->required()
                    ->numeric()
                    ->minValue(0),

                Forms\Components\TextInput::make('total_pt')
                    ->label('Total PT')
                    ->required()
                    ->numeric()
                    ->minValue(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('province.name')
                    ->label('Province')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('population')
                    ->label('Population')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('year')
                    ->label('Year')
                    ->sortable(),

                Tables\Columns\TextColumn::make('gdp')
                    ->label('GDP')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_sd')
                    ->label('Total SD')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_smp')
                    ->label('Total SMP')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_sma')
                    ->label('Total SMA')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_pt')
                    ->label('Total PT')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProvinceProfiles::route('/'),
            'create' => Pages\CreateProvinceProfile::route('/create'),
            'edit' => Pages\EditProvinceProfile::route('/{record}/edit'),
        ];
    } 
    public static function getModelLabel(): string
    {
        return 'Province Profile';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Province Profiles';
    }
}