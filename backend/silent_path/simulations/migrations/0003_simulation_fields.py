from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('simulations', '0002_simulation_created_at_simulation_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='simulation',
            name='data',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='simulation',
            name='grid_height',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='simulation',
            name='grid_width',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='simulation',
            name='name',
            field=models.CharField(default='Untitled Simulation', max_length=255),
        ),
        migrations.AddField(
            model_name='simulation',
            name='schematic_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='simulation',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
