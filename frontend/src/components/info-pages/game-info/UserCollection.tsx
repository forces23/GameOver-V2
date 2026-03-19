import { formatCurrency, formatUnixTime, toTitleCase } from '@/lib/utils';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';
import CollectedGamesDetails from '../CollectedGamesDetails';
import { GameSimple } from '@/lib/types';
import { useRouter } from 'next/navigation';

type UserGameCopy = {
    platform?: {
        igdb_id?: number;
        slug?: string;
        name?: string;
    };
    media_type?: string;
    condition?: string;
    purchase_date?: number;
    purchase_price?: number;
    upc?: string;
    storage_location?: string;
    copies?: number;
    copy_notes?: string;
};

type UserGameData = {
    rating?: number;
    notes?: string;
    copies?: UserGameCopy[];
};

type UserCollectionProps = {
    userGameData?: GameSimple;
    refreshPage?: () => void;
}

export default function UserCollection({ userGameData, refreshPage }: UserCollectionProps) {
    const copies = userGameData?.copies ?? [];
    const totalCopiesOwned = copies.reduce((sum, copy) => sum + (copy.copies ?? 0), 0);
    const hasCollectionData =
        Boolean(userGameData?.rating) ||
        Boolean(userGameData?.notes?.trim()) ||
        copies.length > 0;

    const [editDetailsOpen, setEditDetailsOpen] = useState<boolean>(false);

    if (!hasCollectionData) {
        return (
            <section className="rounded-2xl border border-dashed bg-background/50 p-6">
                <h2 className="text-2xl font-semibold">Your Collection</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    No collection details have been saved for this game yet.
                </p>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <div className='flex gap-3'>
                    <h2 className="text-2xl font-semibold">Your Collection</h2>  <FaPencil onClick={() => setEditDetailsOpen(true)} className='hover:size-5' />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    Saved details for your owned copies of this game.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Copies Logged
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{totalCopiesOwned}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Across {copies.length} entr{copies.length === 1 ? "y" : "ies"}
                    </p>
                </div>

                <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Your Rating
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                        {userGameData?.rating ? `${userGameData.rating}/5` : "Unrated"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Personal score for this title
                    </p>
                </div>

                <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Collection Notes
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/90">
                        {userGameData?.notes?.trim() || "No collection notes added."}
                    </p>
                </div>
            </div>

            {copies.length > 0 && (
                <div className="grid gap-4">
                    {copies.map((copy, index) => (
                        <article
                            key={`${copy.platform?.igdb_id ?? "platform"}-${copy.purchase_date ?? "date"}-${index}`}
                            className="rounded-2xl border bg-background p-4"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {copy.platform?.name || "Unknown Platform"}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Entry {index + 1}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        {toTitleCase(copy.media_type)}
                                    </span>
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        {toTitleCase(copy.condition)}
                                    </span>
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        Qty {copy.copies ?? 0}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-xl bg-secondary/60 p-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Purchase Date
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        {copy.purchase_date ? formatUnixTime(copy.purchase_date) : "Not recorded"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-secondary/60 p-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Purchase Price
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        {formatCurrency(copy.purchase_price)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-secondary/60 p-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        UPC
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        {copy.upc ?? "Not recorded"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-secondary/60 p-3 sm:col-span-2 xl:col-span-1">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Storage Location
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        {copy.storage_location?.trim() || "Not recorded"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-dashed p-3">
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    Copy Notes
                                </p>
                                <p className="mt-2 text-sm leading-6 text-foreground/90">
                                    {copy.copy_notes?.trim() || "No notes for this copy."}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <CollectedGamesDetails
                open={editDetailsOpen}
                setOpen={setEditDetailsOpen}
                mode="edit"
                existingData={userGameData}
                onSaved={refreshPage}
            />

        </section>
    )
}
