<?php

namespace App\Filament\Resources\Produits\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProduitsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('categorie.nom')
                    ->searchable(),
                TextColumn::make('fournisseur.nom')
                    ->searchable(),
                TextColumn::make('nom')
                    ->searchable(),
                TextColumn::make('reference')
                    ->searchable(),
                TextColumn::make('unite')
                    ->searchable(),
                TextColumn::make('prix_achat')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('prix_vente')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('quantite_stock')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('seuil_alerte')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
