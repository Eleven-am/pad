"use client";

import {ChangeEvent, ReactNode, useState} from "react";
import {UploadComponent} from "./upload-component";
import {Input} from "./ui/input";
import {Textarea} from "./ui/textarea";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Label} from "./ui/label";
import {File as FileModel} from '@/generated/prisma';
import {Bell, Camera, FileText, Github, Globe, Instagram, Linkedin, Settings, User} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {useFileId} from "@/hooks/useFileId";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Switch} from "./ui/switch";
import Link from "next/link";

enum PostVisibility {
	PUBLIC = "public",
	PRIVATE = "private",
	DRAFT = "draft"
}

enum PostTemplate {
	STANDARD = "standard",
	FEATURED = "featured",
	MINIMAL = "minimal"
}

enum PostCategory {
	TECHNOLOGY = "technology",
	LIFESTYLE = "lifestyle",
	BUSINESS = "business"
}

interface FormFieldProps {
	label: string;
	id: string;
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	placeholder?: string;
	type?: string;
	className?: string;
	as?: "input" | "textarea";
}

interface ProfileCardProps {
	name: string;
	email: string;
	profilePictureUrl: string;
	handleCameraClick: () => void;
	handleFileUpload: (file: FileModel) => void;
}

interface SocialLinksCardProps {
	socialLinks: { github: string; linkedin: string; instagram: string };
	handleSocialLinkChange: (platform: keyof SocialLinksCardProps["socialLinks"], value: string) => void;
}

interface ProfileState {
	name: string;
	email: string;
	bio: string;
	showEmail: boolean;
	showSocialLinks: boolean;
}

interface ContentSettings {
	defaultPostVisibility: PostVisibility;
	defaultPostTemplate: PostTemplate;
	defaultPostCategory: PostCategory;
}

interface NotificationSettings {
	postShares: boolean;
	postLikes: boolean;
	platformUpdates: boolean;
	systemMaintenance: boolean;
	policyChanges: boolean;
}

interface SocialLinks {
	github: string;
	linkedin: string;
	instagram: string;
}

interface ProfileTabsProps {
	profile: ProfileState;
	setProfile: (profile: ProfileState) => void;
	contentSettings: ContentSettings;
	setContentSettings: (settings: ContentSettings) => void;
	notificationSettings: NotificationSettings;
	setNotificationSettings: (settings: NotificationSettings) => void;
	twoFactorEnabled: boolean;
	setTwoFactorEnabled: (v: boolean) => void;
}

interface ProfileTabsContentProps {
	value: string;
	title: string;
	Icon: ReactNode;
	description: string;
	children: ReactNode;
}

function FormField ({
	label,
	id,
	value,
	onChange,
	placeholder,
	type = "text",
	className = "",
	as = "input"
}: FormFieldProps) {
	return (
		<div className="space-y-2 flex flex-col">
			<Label htmlFor={id}>{label}</Label>
			{as === "textarea" ? (
				<Textarea
					id={id}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className={`bg-muted/50 min-h-[100px] flex-1 ${className}`}
				/>
			) : (
				<Input
					id={id}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className={`bg-muted/50 ${className}`}
				/>
			)}
		</div>
	);
}

function ProfileCard ({name, email, profilePictureUrl, handleCameraClick, handleFileUpload}: ProfileCardProps) {
	return (
		<Card className="overflow-hidden p-0 border-none shadow-lg flex-1 flex flex-col">
			<div className="h-36 bg-gradient-to-r from-blue-500 to-purple-500"/>
			<CardContent className="p-2 pt-0 flex-1 flex flex-col justify-start">
				<div className="flex flex-col items-center space-y-4 -mt-16">
					<div className="relative group">
						<Avatar className="h-32 w-32 border-4 border-background shadow-xl">
							<AvatarImage src={profilePictureUrl} alt="Profile picture"/>
							<AvatarFallback
								className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
								{name.slice (0, 2).toUpperCase () || "PP"}
							</AvatarFallback>
						</Avatar>
						<div
							className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<Button
								variant="secondary"
								size="icon"
								className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
								onClick={handleCameraClick}
							>
								<Camera className="h-5 w-5"/>
							</Button>
						</div>
					</div>
					<div className="text-center">
						<h2 className="text-2xl font-semibold tracking-tight">{name || "Your Name"}</h2>
						<p className="text-muted-foreground">{email || "your.email@example.com"}</p>
						<Button variant="link" className="text-blue-500 hover:text-blue-600 mt-2" asChild>
							<Link href="/dashboard">Go to Dashboard</Link>
						</Button>
					</div>
					<div className="w-full hidden">
						<UploadComponent
							fileTypes={["image/jpeg", "image/png", "image/gif"]}
							onFileUpload={handleFileUpload}
							label="Change profile picture"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SocialLinksCard ({socialLinks, handleSocialLinkChange}: SocialLinksCardProps) {
	return (
		<Card className="border-none shadow-lg h-full flex flex-col">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<Globe className="h-5 w-5 text-blue-500"/>
					Social Links
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<Github className="h-5 w-5 text-foreground/70"/>
					<Input
						placeholder="GitHub URL"
						value={socialLinks.github}
						onChange={e => handleSocialLinkChange ("github", e.target.value)}
						className="bg-muted/50"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Linkedin className="h-5 w-5 text-foreground/70"/>
					<Input
						placeholder="LinkedIn URL"
						value={socialLinks.linkedin}
						onChange={e => handleSocialLinkChange ("linkedin", e.target.value)}
						className="bg-muted/50"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Instagram className="h-5 w-5 text-foreground/70"/>
					<Input
						placeholder="Instagram URL"
						value={socialLinks.instagram}
						onChange={e => handleSocialLinkChange ("instagram", e.target.value)}
						className="bg-muted/50"
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function ProfileTabsContent ({value, title, description, Icon, children}: ProfileTabsContentProps) {
	return (
		<TabsContent value={value} className="space-y-6 flex-1 flex flex-col my-0 h-full">
			<Card className="border-none shadow-lg flex-1 flex flex-col h-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{Icon}
						{title}
					</CardTitle>
					<CardDescription>
						{description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 flex-1 flex flex-col overflow-y-auto">
					{children}
				</CardContent>
			</Card>
		</TabsContent>
	)
}

function ProfileTabs ({
  profile,
  setProfile,
  contentSettings,
  setContentSettings,
  notificationSettings,
  setNotificationSettings,
  twoFactorEnabled,
  setTwoFactorEnabled
}: ProfileTabsProps) {
	return (
		<Tabs defaultValue="profile" className="space-y-6 flex-1 flex flex-col min-h-full">
			<TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50">
				<TabsTrigger
					value="profile"
					className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<User className="h-4 w-4"/>
					Profile
				</TabsTrigger>
				<TabsTrigger
					value="content"
					className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<FileText className="h-4 w-4"/>
					Content
				</TabsTrigger>
				<TabsTrigger
					value="notifications"
					className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<Bell className="h-4 w-4"/>
					Notifications
				</TabsTrigger>
				<TabsTrigger
					value="settings"
					className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<Settings className="h-4 w-4"/>
					Settings
				</TabsTrigger>
			</TabsList>
			
			<div className="h-[600px]">
				<ProfileTabsContent
					value="profile"
					title="Profile Information"
					description="Update your profile information and how others see you on the platform."
					Icon={<User className="h-5 w-5 text-blue-500"/>}
				>
					<div className="space-y-6">
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Basic Information</h3>
							<FormField
								label="Name"
								id="name"
								value={profile.name}
								onChange={e => setProfile ({...profile, name: e.target.value})}
								placeholder="Enter your name"
							/>
							<FormField
								label="Email"
								id="email"
								value={profile.email}
								onChange={e => setProfile ({...profile, email: e.target.value})}
								placeholder="Enter your email"
								type="email"
							/>
							<FormField
								label="Bio"
								id="bio"
								value={profile.bio}
								onChange={e => setProfile ({...profile, bio: e.target.value})}
								placeholder="Tell us about yourself and your writing..."
								as="textarea"
							/>
						</div>
						
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>Show Email</Label>
									<p className="text-sm text-muted-foreground">Display your email on your profile</p>
								</div>
								<Switch
									checked={profile.showEmail}
									onCheckedChange={checked => setProfile ({...profile, showEmail: checked})}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Show Social Links</Label>
									<p className="text-sm text-muted-foreground">Display your social media links</p>
								</div>
								<Switch
									checked={profile.showSocialLinks}
									onCheckedChange={checked => setProfile ({...profile, showSocialLinks: checked})}
								/>
							</div>
						</div>
					</div>
				</ProfileTabsContent>
				
				<ProfileTabsContent
					value="content"
					title="Content Management"
					description="Manage your content settings and preferences."
					Icon={<FileText className="h-5 w-5 text-blue-500"/>}
				>
					<h3 className="text-sm font-medium mb-4">Default Post Settings</h3>
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Default Post Visibility</Label>
								<Select
									value={contentSettings.defaultPostVisibility}
									onValueChange={value => setContentSettings({
										...contentSettings,
										defaultPostVisibility: value as PostVisibility
									})}
								>
									<SelectTrigger className={'w-full'}>
										<SelectValue placeholder="Select default visibility"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={PostVisibility.PUBLIC}>Public</SelectItem>
										<SelectItem value={PostVisibility.PRIVATE}>Private</SelectItem>
										<SelectItem value={PostVisibility.DRAFT}>Draft</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Default Post Template</Label>
								<Select
									value={contentSettings.defaultPostTemplate}
									onValueChange={value => setContentSettings({
										...contentSettings,
										defaultPostTemplate: value as PostTemplate
									})}
								>
									<SelectTrigger className={'w-full'}>
										<SelectValue placeholder="Select default template"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={PostTemplate.STANDARD}>Standard</SelectItem>
										<SelectItem value={PostTemplate.FEATURED}>Featured</SelectItem>
										<SelectItem value={PostTemplate.MINIMAL}>Minimal</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Default Post Category</Label>
								<Select
									value={contentSettings.defaultPostCategory}
									onValueChange={value => setContentSettings({
										...contentSettings,
										defaultPostCategory: value as PostCategory
									})}
								>
									<SelectTrigger className={'w-full'}>
										<SelectValue placeholder="Select default category"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={PostCategory.TECHNOLOGY}>Technology</SelectItem>
										<SelectItem value={PostCategory.LIFESTYLE}>Lifestyle</SelectItem>
										<SelectItem value={PostCategory.BUSINESS}>Business</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Content Features</h3>
							<div className="flex items-center justify-between">
								<div>
									<Label>Auto-save Drafts</Label>
									<p className="text-sm text-muted-foreground">Automatically save your post drafts</p>
								</div>
								<Switch/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Schedule Posts</Label>
									<p className="text-sm text-muted-foreground">Enable post scheduling</p>
								</div>
								<Switch/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Featured Posts</Label>
									<p className="text-sm text-muted-foreground">Allow posts to be featured</p>
								</div>
								<Switch/>
							</div>
						</div>
					</div>
				</ProfileTabsContent>
				
				<ProfileTabsContent
					value="notifications"
					title="Notification Preferences"
					description="Choose what notifications you want to receive."
					Icon={<Bell className="h-5 w-5 text-blue-500"/>}
				>
					<div className="space-y-6">
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Post Engagement</h3>
							<div className="flex items-center justify-between">
								<div>
									<Label>Post Shares</Label>
									<p className="text-sm text-muted-foreground">Get notified when your posts are
										shared</p>
								</div>
								<Switch
									checked={notificationSettings.postShares}
									onCheckedChange={checked => setNotificationSettings ({
										...notificationSettings,
										postShares: checked
									})}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Post Likes</Label>
									<p className="text-sm text-muted-foreground">Get notified when your posts are
										liked</p>
								</div>
								<Switch
									checked={notificationSettings.postLikes}
									onCheckedChange={checked => setNotificationSettings ({
										...notificationSettings,
										postLikes: checked
									})}
								/>
							</div>
						</div>
						
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Platform Updates</h3>
							<div className="flex items-center justify-between">
								<div>
									<Label>New Features</Label>
									<p className="text-sm text-muted-foreground">Get notified about new features</p>
								</div>
								<Switch
									checked={notificationSettings.platformUpdates}
									onCheckedChange={checked => setNotificationSettings ({
										...notificationSettings,
										platformUpdates: checked
									})}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>System Maintenance</Label>
									<p className="text-sm text-muted-foreground">Get notified about system
										maintenance</p>
								</div>
								<Switch
									checked={notificationSettings.systemMaintenance}
									onCheckedChange={checked => setNotificationSettings ({
										...notificationSettings,
										systemMaintenance: checked
									})}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Policy Changes</Label>
									<p className="text-sm text-muted-foreground">Get notified about policy changes</p>
								</div>
								<Switch
									checked={notificationSettings.policyChanges}
									onCheckedChange={checked => setNotificationSettings ({
										...notificationSettings,
										policyChanges: checked
									})}
								/>
							</div>
						</div>
					</div>
				</ProfileTabsContent>
				
				<ProfileTabsContent
					value="settings"
					title="Account Settings"
					description="Manage your account security and preferences."
					Icon={<Settings className="h-5 w-5 text-blue-500"/>}
				>
					<div className="space-y-6">
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Security</h3>
							<div className="flex items-center justify-between">
								<div>
									<Label>Two-Factor Authentication</Label>
									<p className="text-sm text-muted-foreground">Add an extra layer of security to your
										account</p>
								</div>
								<Switch
									checked={twoFactorEnabled}
									onCheckedChange={checked => setTwoFactorEnabled (checked)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Active Sessions</Label>
								<div className="rounded-lg border p-4">
									<p className="text-sm text-muted-foreground">Current session: This device</p>
									<p className="text-xs text-muted-foreground">Last active: Just now</p>
								</div>
							</div>
							<div className="space-y-2">
								<Label>API Keys</Label>
								<Button variant="outline" className="w-full">Manage API Keys</Button>
							</div>
						</div>
					</div>
				</ProfileTabsContent>
			</div>
		</Tabs>
	);
}

export function ProfilePage () {
	const [profilePicture, setProfilePicture] = useState<FileModel | null> (null);
	const [profile, setProfile] = useState<ProfileState> ({
		name: "",
		email: "",
		bio: "",
		showEmail: false,
		showSocialLinks: true
	});
	const [contentSettings, setContentSettings] = useState<ContentSettings> ({
		defaultPostVisibility: PostVisibility.PUBLIC,
		defaultPostTemplate: PostTemplate.STANDARD,
		defaultPostCategory: PostCategory.TECHNOLOGY
	});
	const [notificationSettings, setNotificationSettings] = useState<NotificationSettings> ({
		postShares: true,
		postLikes: true,
		platformUpdates: true,
		systemMaintenance: true,
		policyChanges: true
	});
	const [twoFactorEnabled, setTwoFactorEnabled] = useState (false);
	const [socialLinks, setSocialLinks] = useState<SocialLinks> ({
		github: "",
		linkedin: "",
		instagram: ""
	});
	
	const {url: profilePictureUrl} = useFileId (profilePicture?.id || "");
	
	const handleFileUpload = (file: FileModel) => {
		setProfilePicture (file);
	};
	
	const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
		setSocialLinks (prev => ({
			...prev,
			[platform]: value
		}));
	};
	
	const handleCameraClick = () => {
		const fileInput = document.querySelector ('input[type="file"]') as HTMLInputElement;
		fileInput?.click ();
	};
	
	return (
		<div className="bg-gradient-to-br from-background to-muted/20">
			<div className="container max-w-5xl mx-auto py-8 px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
					<div className="md:col-span-1 flex flex-col h-full gap-6">
						<div className="flex-1 flex flex-col">
							<ProfileCard
								name={profile.name}
								email={profile.email}
								profilePictureUrl={profilePictureUrl}
								handleCameraClick={handleCameraClick}
								handleFileUpload={handleFileUpload}
							/>
						</div>
						<div>
							<SocialLinksCard
								socialLinks={socialLinks}
								handleSocialLinkChange={handleSocialLinkChange}
							/>
						</div>
					</div>
					<div className="md:col-span-2 flex flex-col h-full">
						<ProfileTabs
							profile={profile}
							setProfile={setProfile}
							contentSettings={contentSettings}
							setContentSettings={setContentSettings}
							notificationSettings={notificationSettings}
							setNotificationSettings={setNotificationSettings}
							twoFactorEnabled={twoFactorEnabled}
							setTwoFactorEnabled={setTwoFactorEnabled}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
