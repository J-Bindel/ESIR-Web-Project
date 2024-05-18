import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserDeletedEvent } from '../users/user.events';
import { AssociationsService } from './associations.service';

@Injectable()
export class AssociationListener {
    constructor(private readonly associationsService: AssociationsService) {}

    @OnEvent('user.deleted')
    handleUserDeletedEvent(event: UserDeletedEvent) {
        this.associationsService.removeUsersDeleted(event.id);
    }
}