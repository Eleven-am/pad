"use client";

import Image from 'next/image';
import { ImagesBlock as PrismaImagesBlock, GalleryImage } from '@/generated/prisma';
import { getPublicUrl } from "@/lib/data";
import { sortBy } from "@eleven-am/fp";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {cn} from "@/lib/utils";
import {Modal, ModalContent, ModalTrigger} from "@/components/ui/modal";
import {unwrap} from "@/lib/unwrap";
import {BlockLoading} from "@/components/blocks/loading";
import {Suspense, use, useMemo} from "react";

interface AwaitedImage {
	publicUrl: string
	id: string
	caption: string | null
	alt: string
	order: number
	fileId: string
	galleryId: string
}

interface MediaGalleryProps {
	block: PrismaImagesBlock & {
		images: GalleryImage[];
	};
}

function Block({ block, filePromises }: MediaGalleryProps & { filePromises: Promise<AwaitedImage[]> }) {
	const { images, caption } = block;
	const awaitedImages =  use(filePromises)
	const sortedImages = useMemo(() => sortBy(awaitedImages, ['order'], ['asc']), [awaitedImages]);
	
	if (!images || images.length === 0) {
		return null;
	}
	
	const renderSingleImage = () => (
		<div className="relative w-full group">
			<img
				src={sortedImages[0].publicUrl}
				alt={sortedImages[0].alt}
				className="w-full h-auto rounded-lg object-cover shadow-sm dark:shadow-black/30 shadow-gray-300 transition-transform duration-200 group-hover:scale-[1.02]"
				loading="lazy"
			/>
		</div>
	);
	
	const renderTwoImages = () => (
		<div className="grid grid-cols-2 gap-3">
			{sortedImages.slice(0, 2).map((image) => (
				<div key={image.id} className="relative group hover:scale-[1.02]">
					<img
						src={image.publicUrl}
						alt={image.alt}
						className="w-full h-72 rounded-lg object-cover shadow-sm dark:shadow-black/30 shadow-gray-300 transition-transform duration-200"
						loading="lazy"
					/>
					{image.caption && (
						<p
							className="absolute bottom-0 m-0 w-full font-bold text-center text-white bg-gradient-to-t from-black/20 to-transparent text-xs md:text-sm p-2 rounded-b-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100"
						>
							{image.caption}
						</p>
					)}
				</div>
			))}
		</div>
	);
	
	const renderThreeImages = () => (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-3">
				{sortedImages.slice(0, 2).map((image) => (
					<div key={image.id} className="relative group hover:scale-[1.02]">
						<img
							src={image.publicUrl}
							alt={image.alt}
							className="w-full h-72 rounded-lg object-cover shadow-sm dark:shadow-black/30 shadow-gray-300 transition-transform duration-200"
							loading="lazy"
						/>
						{image.caption && (
							<p
								className="absolute bottom-0 m-0 w-full font-bold text-center text-white bg-gradient-to-t from-black/20 to-transparent text-xs md:text-sm p-2 rounded-b-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100"
							>
								{image.caption}
							</p>
						)}
					</div>
				))}
			</div>
			<div className="relative group p-0 hover:scale-[1.02]">
				<img
					src={sortedImages[2].publicUrl}
					alt={sortedImages[2].alt}
					className="w-full h-96 rounded-lg object-cover shadow-sm dark:shadow-black/30 shadow-gray-300 transition-transform duration-200"
					loading="lazy"
				/>
				{sortedImages[2].caption && (
					<p
						className="absolute bottom-0 m-0 w-full font-bold text-center text-white bg-gradient-to-t from-black/20 to-transparent text-xs md:text-sm p-2 rounded-b-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100"
					>
						{sortedImages[2].caption}
					</p>
				)}
			</div>
		</div>
	);
	
	const renderStackedImages = () => {
		const remainingCount = sortedImages.length - 1;
		
		return (
			<div className="relative group cursor-pointer min-h-96">
				{sortedImages[3] && (
					<div className="absolute inset-0 transform rotate-[-1deg] group-hover:rotate-[-3deg] transition-transform duration-300">
						<div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-700 overflow-hidden">
							<img
								src={sortedImages[3].publicUrl}
								alt={sortedImages[3].alt}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						</div>
					</div>
				)}
				
				{sortedImages[2] && (
					<div className="absolute inset-0 transform rotate-[2deg] group-hover:rotate-[4deg] transition-transform duration-300">
						<div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-700 overflow-hidden">
							<img
								src={sortedImages[2].publicUrl}
								alt={sortedImages[2].alt}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						</div>
					</div>
				)}
				
				{sortedImages[1] && (
					<div className="absolute inset-0 transform rotate-[-3deg] group-hover:rotate-[-5deg] transition-transform duration-300">
						<div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-700 overflow-hidden">
							<img
								src={sortedImages[1].publicUrl}
								alt={sortedImages[1].alt}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						</div>
					</div>
				)}
				
				<Modal className="relative transform transition-transform duration-300 group-hover:scale-[1.02] group-hover:-rotate-[0.5deg]">
					<ModalTrigger asChild>
						<div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
							<img
								src={sortedImages[0].publicUrl}
								alt={sortedImages[0].alt}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
							
							<div className="absolute rounded-lg inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<div className="text-center">
		                                <span
			                                style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}
			                                className="text-white text-2xl md:text-3xl font-medium block"
		                                >
		                                    +{remainingCount}
		                                </span>
									<span
										style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}
										className="text-white/80 text-sm md:text-base"
									>
		                                    more images
		                                </span>
								</div>
							</div>
						</div>
					</ModalTrigger>
					<ModalContent>
						<Carousel>
							<CarouselContent className="w-[40vw] h-[70vh]">
								{sortedImages.map((image) => (
									<CarouselItem key={image.id} className="w-full h-full relative rounded-lg overflow-hidden">
										<img
											src={image.publicUrl}
											alt={image.alt}
											className="w-full h-full object-cover shadow-md dark:shadow-black/30 shadow-black/30 rounded-lg overflow-hidden"
											loading="lazy"
										/>
									</CarouselItem>
								))}
							</CarouselContent>
							{
								caption && (
									<span className={'absolute transform translate-x-1/2 text-primary'}>
										{caption}
									</span>
								)
							}
							<CarouselPrevious
								className={cn('absolute left-3 top-1/2 -ml-16 -translate-y-1/2 dark:bg-black/10 dark:hover:bg-black/20 pointer-events-auto')}
							/>
							<CarouselNext
								className={cn('absolute right-3 top-1/2 -mr-16 -translate-y-1/2 dark:bg-black/10 dark:hover:bg-black/20 pointer-events-auto')}
							/>
						</Carousel>
					</ModalContent>
				</Modal>
			</div>
		);
	};
	
	const renderGallery = () => {
		switch (sortedImages.length) {
			case 1:
				return renderSingleImage();
			case 2:
				return renderTwoImages();
			case 3:
				return renderThreeImages();
			default:
				return renderStackedImages();
		}
	};
	
	return (
		<div>
			{renderGallery()}
			{caption && (
				<p
					style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}
					className="text-xs md:text-sm text-muted-foreground text-center italic pt-4"
				>
					{caption}
				</p>
			)}
		</div>
	);
}

export function ImagesBlock({ block }: MediaGalleryProps) {
	const mappedPromises = useMemo(() => {
		return block.images.map(async (image) => {
			const publicUrl = await unwrap(getPublicUrl(image.fileId));
			return {
				publicUrl,
				id: image.id,
				caption: image.caption,
				alt: image.alt,
				order: image.order,
				fileId: image.fileId,
				galleryId: image.galleryId,
			};
		});
	}, [block.images]);
	
	return (
		<Suspense fallback={<BlockLoading/>}>
			<Block
				block={block}
				filePromises={Promise.all(mappedPromises)}
			/>
		</Suspense>
	)
}
