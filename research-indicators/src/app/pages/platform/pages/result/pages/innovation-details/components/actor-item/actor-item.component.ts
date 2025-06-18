import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SubmissionService } from '@shared/services/submission.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { Actor, GetInnovationDetails } from '@shared/interfaces/get-innovation-details.interface';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { SelectModule } from 'primeng/select';
import { GetActorTypesService } from '@shared/services/control-list/get-actor-types.service';

@Component({
  selector: 'app-actor-item',
  standalone: true,
  imports: [CheckboxModule, FormsModule, InputTextModule, TextareaModule, SelectModule, InputComponent],
  templateUrl: './actor-item.component.html',
})
export class ActorItemComponent implements OnInit {
  @Output() deleteActorEvent = new EventEmitter();
  @Input() actor: Actor = new Actor();
  @Input() index: number | null = null;
  @Input() actorNumber: number | null = null;
  @Input() bodySignal: WritableSignal<GetInnovationDetails> = signal(new GetInnovationDetails());
  body = signal<Actor>(new Actor());
  submission = inject(SubmissionService);
  isPrivate = false;
  actorService = inject(GetActorTypesService);

  syncBody = effect(() => {
    if (this.index === null) return;
    const parentActor = this.bodySignal().actors?.[this.index];
    if (parentActor && JSON.stringify(parentActor) !== JSON.stringify(this.body())) {
      this.body.set(parentActor);
      return;
    }
    if (this.actor && JSON.stringify(this.actor) !== JSON.stringify(this.body())) {
      this.body.set(this.actor);
    }
  });

  onChange = effect(
    () => {
      if (this.index === null) return;

      this.bodySignal.update((body: GetInnovationDetails) => {
        if (!body.actors) {
          body.actors = [];
        }

        while (body.actors.length <= this.index!) {
          body.actors.push(new Actor());
        }

        return { ...body };
      });
    },
    { allowSignalWrites: true }
  );

  ngOnInit() {
    this.body.set(this.actor);
  }

  deleteActor() {
    this.deleteActorEvent.emit();
  }

  get actorMissing(): boolean {
    return !this.body()?.actor_type_id;
  }

  onDisaggregationChange(event: { checked: boolean }) {
    if (event.checked) {
      this.body.update(current => ({
        ...current,
        women_youth: false,
        women_not_youth: false,
        men_youth: false,
        men_not_youth: false
      }));
    }
  }

  onActorTypeChange(event: number) {
    if (event !== 5) {
      const updatedActor = {
        ...this.body(),
        actor_type_id: event,
        actor_type_custom_name: undefined
      };
      this.body.set(updatedActor);

      if (this.index !== null) {
        this.bodySignal.update(current => {
          const updatedActors = [...(current.actors || [])];
          updatedActors[this.index!] = updatedActor;
          return { ...current, actors: updatedActors };
        });
      }
    }
  }
}
