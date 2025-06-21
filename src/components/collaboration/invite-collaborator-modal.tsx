"use client";

import {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {CollaboratorRole} from '@/generated/prisma';
import {inviteCollaborator, unwrap} from '@/lib/data';
import {useRouter} from 'next/navigation';

interface InviteCollaboratorModalProps {
	postId: string;
	open: boolean;
	userId: string;
	onOpenChange: (open: boolean) => void;
}

export function InviteCollaboratorModal ({postId, open, onOpenChange, userId}: InviteCollaboratorModalProps) {
	const [email, setEmail] = useState ('');
	const [role, setRole] = useState<CollaboratorRole> ('CONTRIBUTOR');
	const [loading, setLoading] = useState (false);
	const router = useRouter ();
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault ();
		if ( ! email.trim ()) return;
		
		setLoading (true);
		try {
			// Note: inviterUserId will be handled by the server action
			await unwrap(inviteCollaborator(postId, email.trim(), role, userId));
			
			setEmail ('');
			setRole ('CONTRIBUTOR');
			onOpenChange (false);
			router.refresh ();
		} catch (error) {
			console.error ('Failed to invite collaborator:', error);
			// TODO: Add toast notification
		} finally {
			setLoading (false);
		}
	};
	
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Invite Collaborator</DialogTitle>
				</DialogHeader>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							placeholder="colleague@example.com"
							value={email}
							onChange={(e) => setEmail (e.target.value)}
							required
						/>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<Select value={role} onValueChange={(value) => setRole(value as CollaboratorRole)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select role">
									{role === 'CONTRIBUTOR' ? 'Contributor' : 'Reviewer'}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="CONTRIBUTOR">
									<div>
										<div className="font-medium">Contributor</div>
										<div className="text-sm text-muted-foreground">
											Can edit content and invite others
										</div>
									</div>
								</SelectItem>
								<SelectItem value="REVIEWER">
									<div>
										<div className="font-medium">Reviewer</div>
										<div className="text-sm text-muted-foreground">
											Can view and comment on content
										</div>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					
					<div className="flex justify-end gap-2 pt-4">
						<Button type="button" variant="outline" onClick={() => onOpenChange (false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading || ! email.trim ()}>
							{loading ? 'Sending...' : 'Send Invitation'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
