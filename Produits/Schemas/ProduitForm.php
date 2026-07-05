<?php

namespace App\Filament\Resources\Produits\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ProduitForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('categorie_id')
                    ->relationship('categorie', 'nom')
                    ->searchable()
                    ->preload()
                    ->required(),
                Select::make('fournisseur_id')
                    ->relationship('fournisseur', 'nom')
                    ->searchable()
                    ->preload()
                    ->default(null),
                TextInput::make('nom')
                    ->required(),
                TextInput::make('reference')
                    ->required(),
                Textarea::make('description')
                    ->default(null)
                    ->columnSpanFull(),
                TextInput::make('unite')
                    ->required()
                    ->default('piece'),
                TextInput::make('prix_achat')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('prix_vente')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('quantite_stock')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('seuil_alerte')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
