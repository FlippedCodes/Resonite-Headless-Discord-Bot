import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

export class IntervalTask extends ScheduledTask {
  public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
    super(context, {
      ...options,
      interval: 60_000, // 60 seconds
    });
  }

  public async run() {
		if (process.env.NODE_ENV === 'development') return;
		const url = process.env.uptimeUrl as string;
    fetch(url.replace('{ping}', this.container.client.ws.ping.toString()));
  }
}

declare module '@sapphire/plugin-scheduled-tasks' {
  interface ScheduledTasks {
    interval: never;
  }
}
