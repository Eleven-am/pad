import {createBadRequestError, Http, TaskEither} from "@eleven-am/fp";
import {MediaService} from "@/services/mediaService";
import {BlockType, CreateInstagramBlockInput, UnifiedBlockOutput} from "@/services/types";
import {ContentService} from "@/services/contentService";

interface InstagramPostResponse {
	data: {
		xdt_shortcode_media: {
			__typename: string;
			__isXDTGraphMediaInterface: string;
			id: string;
			shortcode: string;
			thumbnail_src: string;
			dimensions: {
				height: number;
				width: number;
			};
			gating_info: null;
			fact_check_overall_rating: null;
			fact_check_information: null;
			sensitivity_friction_info: null;
			sharing_friction_info: {
				should_have_sharing_friction: boolean;
				bloks_app_url: null;
			};
			media_overlay_info: null;
			media_preview: null | string;
			display_url: string;
			display_resources: {
				src: string;
				config_width: number;
				config_height: number;
			}[];
			is_video: boolean;
			tracking_token: string;
			upcoming_event: null;
			edge_media_to_tagged_user: {
				edges: {
					node: {
						user: {
							full_name: string;
							followed_by_viewer: boolean;
							id: string;
							is_verified: boolean;
							profile_pic_url: string;
							username: string;
						};
						x: number;
						y: number;
						id: string;
					};
				}[];
			};
			owner: {
				id: string;
				username: string;
				is_verified: boolean;
				profile_pic_url: string;
				blocked_by_viewer: boolean;
				restricted_by_viewer: null;
				followed_by_viewer: boolean;
				full_name: string;
				has_blocked_viewer: boolean;
				is_embeds_disabled: boolean;
				is_private: boolean;
				is_unpublished: boolean;
				requested_by_viewer: boolean;
				pass_tiering_recommendation: boolean;
				edge_owner_to_timeline_media: {
					count: number;
				};
				edge_followed_by: {
					count: number;
				};
			};
			accessibility_caption: string;
			edge_sidecar_to_children: {
				edges: {
					node: {
						__typename: string;
						id: string;
						shortcode: string;
						dimensions: {
							height: number;
							width: number;
						};
						gating_info: null;
						fact_check_overall_rating: null;
						fact_check_information: null;
						sensitivity_friction_info: null;
						sharing_friction_info: {
							should_have_sharing_friction: boolean;
							bloks_app_url: null;
						};
						media_overlay_info: null;
						media_preview: string;
						display_url: string;
						display_resources: {
							src: string;
							config_width: number;
							config_height: number;
						}[];
						accessibility_caption: string;
						is_video: boolean;
						tracking_token: string;
						upcoming_event: null;
						edge_media_to_tagged_user: {
							edges: {
								node: {
									user: {
										full_name: string;
										followed_by_viewer: boolean;
										id: string;
										is_verified: boolean;
										profile_pic_url: string;
										username: string;
									};
									x: number;
									y: number;
									id: string;
								};
							}[];
						};
					};
				}[];
			};
			edge_media_to_caption: {
				edges: {
					node: {
						created_at: string;
						text: string;
						id: string;
					};
				}[];
			};
			can_see_insights_as_brand: boolean;
			caption_is_edited: boolean;
			has_ranked_comments: boolean;
			like_and_view_counts_disabled: boolean;
			edge_media_to_parent_comment: {
				count: number;
				page_info: {
					has_next_page: boolean;
					end_cursor: string;
				};
				edges: {
					node: {
						id: string;
						text: string;
						created_at: number;
						did_report_as_spam: boolean;
						owner: {
							id: string;
							is_verified: boolean;
							profile_pic_url: string;
							username: string;
						};
						viewer_has_liked: boolean;
						edge_liked_by: {
							count: number;
						};
						is_restricted_pending: boolean;
						edge_threaded_comments: {
							count: number;
							page_info: {
								has_next_page: boolean;
								end_cursor: null;
							};
						};
					};
				}[];
			};
			edge_media_preview_comment: {
				count: number;
				edges: {
					node: {
						id: string;
						text: string;
						created_at: number;
						did_report_as_spam: boolean;
						owner: {
							id: string;
							is_verified: boolean;
							profile_pic_url: string;
							username: string;
						};
						viewer_has_liked: boolean;
						edge_liked_by: {
							count: number;
						};
						is_restricted_pending: boolean;
					};
				}[];
			};
			comments_disabled: boolean;
			commenting_disabled_for_viewer: boolean;
			taken_at_timestamp: number;
			edge_media_preview_like: {
				count: number;
			};
			is_affiliate: boolean;
			is_paid_partnership: boolean;
			location: {
				id: string;
				has_public_page: boolean;
				name: string;
				slug: string;
				address_json: string;
			} | null;
			nft_asset_info: null;
			viewer_has_liked: boolean;
			viewer_has_saved: boolean;
			viewer_has_saved_to_collection: boolean;
			viewer_in_photo_of_you: boolean;
			viewer_can_reshare: boolean;
			is_ad: boolean;
			coauthor_producers: {
				id: string;
				is_verified: boolean;
				profile_pic_url: string;
				username: string;
			}[];
		};
	};
	extensions: {
		is_final: boolean;
	};
	status: string;
}

interface Shortcode {
	url: string;
	shortcode?: string;
	error?: string;
}

export class InstagramService {
	private readonly DOC_ID: string = '8845758582119845';
	private readonly SCRAPER_DO_TOKEN: string | undefined = process.env.SCRAPER_DO_TOKEN;
	
	constructor (
		private readonly mediaService: MediaService,
		private readonly contentService: ContentService,
	) {}
	
	isConfigured (): TaskEither<boolean> {
		return TaskEither
			.fromNullable (this.SCRAPER_DO_TOKEN)
			.map (() => true)
			.orElse (() => TaskEither.of (false));
	}
	
	createInstagramPost(postId: string, userId: string, url: string): TaskEither<UnifiedBlockOutput> {
		return TaskEither
			.of(this.normalizeInstagramInput(url))
			.matchTask([
				{
					predicate: ({ shortcode }) => Boolean(shortcode),
					run: ({ shortcode }) => this.getInstagramPostData(postId, shortcode!, userId)
				},
				{
					predicate: ({ error }) => Boolean(error),
					run: ({ error }) => TaskEither.error(createBadRequestError(error!))
				}
			]);
	}
	
	private getInstagramPostData (postId: string, shortCode: string, userId: string): TaskEither<UnifiedBlockOutput> {
		const getFileIds = (urls: { url: string }[]) => TaskEither
			.of(urls)
			.chainItems(({ url }) => this.mediaService.downloadFromUrl (url, userId))
			.mapItems((file) => ({
				fileId: file.id,
			}));
		
		const getFilIdsFromPost  = (post: ReturnType<typeof this.transformInstagramResponseHQ>) => TaskEither
			.fromBind({
				post: TaskEither.of(post),
				files: getFileIds(post.files),
				avatar: this.mediaService.downloadFromUrl(post.avatar, userId).map((u) => u.id)
			});
		
		return this.getDetails(shortCode)
			.map((details) => this.transformInstagramResponseHQ(details))
			.chain((post) => getFilIdsFromPost(post))
			.map(({ post, files, avatar }): CreateInstagramBlockInput => ({
				avatar,
				username: post.username,
				location: post.location,
				date: post.date,
				instagramId: post.instagramId,
				likes: post.likes,
				comments: post.comments,
				caption: post.caption,
				verified: post.verified,
				files: files.map(file => ({
					fileId: file.fileId
				}))
			}))
			.chain((input) => this.contentService.createBlock(postId, {
				type: BlockType.INSTAGRAM,
				data: input
			}));
	}
	
	private getDetails (postId: string): TaskEither<InstagramPostResponse> {
		const variables = {shortcode: postId};
		const variablesStr = encodeURIComponent (JSON.stringify (variables));
		const instagramUrl = `https://www.instagram.com/graphql/query?doc_id=${this.DOC_ID}&variables=${variablesStr}`;
		
		const getTask = (token: string) => {
			const scrapeDoUrl = `https://api.scrape.do/?token=${token}&url=${encodeURIComponent (instagramUrl)}`;
			
			return Http
				.create (scrapeDoUrl)
				.json<InstagramPostResponse> ()
				.getTask ();
		}
		
		return TaskEither
			.fromNullable (this.SCRAPER_DO_TOKEN)
			.chain (token => getTask (token));
	}
	
	private transformInstagramResponseHQ(response: InstagramPostResponse) {
		const media = response.data.xdt_shortcode_media;
		const files: { url: string }[] = [];
		
		if (media.__typename === 'XDTGraphSidecar' && media.edge_sidecar_to_children) {
			media.edge_sidecar_to_children.edges.forEach(edge => {
				const resources = edge.node.display_resources;
				const highestRes = resources[resources.length - 1]; // Last item is usually highest res
				files.push({ url: highestRes.src });
			});
		} else {
			const resources = media.display_resources;
			const highestRes = resources[resources.length - 1];
			files.push({ url: highestRes.src });
		}
		
		const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || undefined;
		const date = new Date(media.taken_at_timestamp * 1000).toISOString();
		const location = media.location?.name || undefined;
		
		return {
			username: media.owner.username,
			avatar: media.owner.profile_pic_url,
			location,
			date,
			instagramId: response.data.xdt_shortcode_media.shortcode,
			likes: media.edge_media_preview_like.count,
			comments: media.edge_media_to_parent_comment.count,
			caption,
			verified: media.owner.is_verified,
			files
		};
	}
	
	private extractInstagramShortcode(url: string): string | null {
		try {
			// Remove any trailing slashes and whitespace
			const cleanUrl = url.trim().replace(/\/$/, '');
			
			// Handle different Instagram URL formats
			const patterns = [
				// Standard post URLs
				/instagram\.com\/p\/([A-Za-z0-9_-]+)/,
				/instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
				/instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
				
				// Mobile URLs
				/instagram\.com\/p\/([A-Za-z0-9_-]+)\//,
				/instagram\.com\/reel\/([A-Za-z0-9_-]+)\//,
				/instagram\.com\/tv\/([A-Za-z0-9_-]+)\//,
				
				// URLs with query parameters
				/instagram\.com\/p\/([A-Za-z0-9_-]+)\?/,
				/instagram\.com\/reel\/([A-Za-z0-9_-]+)\?/,
				/instagram\.com\/tv\/([A-Za-z0-9_-]+)\?/,
				
				// URLs with additional path segments
				/instagram\.com\/p\/([A-Za-z0-9_-]+)\/[^/]*$/,
				/instagram\.com\/reel\/([A-Za-z0-9_-]+)\/[^/]*$/,
				/instagram\.com\/tv\/([A-Za-z0-9_-]+)\/[^/]*$/,
			];
			
			// Try each pattern
			for (const pattern of patterns) {
				const match = cleanUrl.match(pattern);
				if (match && match[1]) {
					return match[1];
				}
			}
			
			return null;
		} catch (error) {
			console.error('Error extracting shortcode:', error);
			return null;
		}
	}
	
	private isValidInstagramShortcode(shortcode: string): boolean {
		// Instagram shortcodes are typically 11 characters, alphanumeric + underscore + dash
		const shortcodePattern = /^[A-Za-z0-9_-]{8,15}$/;
		return shortcodePattern.test(shortcode);
	}
	
	private getInstagramShortcode(url: string): Shortcode {
		const shortcode = this.extractInstagramShortcode(url);
		
		if (!shortcode) {
			return { url, error: `Could not extract shortcode from URL: ${url}` };
		}
		
		if (!this.isValidInstagramShortcode(shortcode)) {
			return { url, error: `Invalid shortcode format: ${shortcode}` };
		}
		
		return { url: `https://www.instagram.com/p/${shortcode}/`, shortcode };
	}
	
	private normalizeInstagramInput(input: string): Shortcode {
		const trimmed = input.trim();
		
		if (trimmed.includes('instagram.com')) {
			return this.getInstagramShortcode(trimmed);
		}
		
		if (this.isValidInstagramShortcode(trimmed)) {
			return {
				url: `https://www.instagram.com/p/${trimmed}/`,
				shortcode: trimmed
			}
		}
		
		return {
			url: trimmed,
			error: `Invalid input: not a valid Instagram URL or shortcode: ${input}`
		}
	}
}
