-- Allow owners to delete invitations
CREATE POLICY "Owners can delete invitations" ON invitations
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
