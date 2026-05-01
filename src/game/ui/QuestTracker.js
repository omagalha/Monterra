export function createQuestTracker(scene) {
  const tracker = {}

  tracker.activeQuest = null

  tracker.panel = scene.add.rectangle(195, 160, 360, 64, 0x111111, 0.82)
    .setStrokeStyle(2, 0xffffff)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false)

  tracker.titleText = scene.add.text(24, 138, '', {
    fontSize: '14px',
    color: '#facc15',
    fontFamily: 'monospace'
  }).setScrollFactor(0).setDepth(10).setVisible(false)

  tracker.progressText = scene.add.text(24, 160, '', {
    fontSize: '13px',
    color: '#ffffff',
    fontFamily: 'monospace'
  }).setScrollFactor(0).setDepth(10).setVisible(false)

  tracker.show = (questState) => {
    tracker.activeQuest = questState

    tracker.panel.setVisible(true)
    tracker.titleText.setVisible(true)
    tracker.progressText.setVisible(true)

    tracker.titleText.setText(`Quest: ${questState.title}`)
    tracker.progressText.setText(
      `${questState.progress}/${questState.requiredAmount} - ${questState.description}`
    )
  }

  tracker.update = (questState) => {
    tracker.activeQuest = questState

    tracker.titleText.setText(`Quest: ${questState.title}`)

    const status = questState.completed
      ? `Concluída - ${questState.description}`
      : `${questState.progress}/${questState.requiredAmount} - ${questState.description}`

    tracker.progressText.setText(status)
  }

  tracker.hide = () => {
    tracker.activeQuest = null
    tracker.panel.setVisible(false)
    tracker.titleText.setVisible(false)
    tracker.progressText.setVisible(false)
  }

  return tracker
}
