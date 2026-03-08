package com.workflow.backend.organization.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "org_invites")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrgInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(nullable = false)
    private String inviteeEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizationRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus status = InviteStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;

    public enum InviteStatus {
        PENDING, ACCEPTED, DECLINED, EXPIRED
    }
}