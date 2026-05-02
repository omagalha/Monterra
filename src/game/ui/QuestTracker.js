import { UI_COLORS, UI_FONT, addPanel } from './theme'

export function createQuestTracker(scene) {
  const tracker = {}

  tracker.activeQuest = null

  const [panelShadow, panel] = addPanel(scene, 24, 132, 342, 70, {
    fill: UI_COLORS.panel,
    alpha: 0.88,
    border: UI_COLORS.borderBright,
    depth: 10
  })
  tracker.panelShadow = panelShadow.setVisible(false)
  tracker.panel = panel.setVisible(false)

  tracker.titleText = scene.add.text(34, 142, '', {
    fontSize: '14px',
    color: UI_COLORS.gold,
    fontFamily: UI_FONT.body
  }).setScrollFactor(0).setDepth(10).setVisible(false)

  tracker.progressText = scene.add.text(34, 164, '', {
    fontSize: '13px',
    color: UI_COLORS.text,
    fontFamily: UI_FONT.body,
    wordWrap: { width: 315 }
  }).setScrollFactor(0).setDepth(10).setVisible(false)

  tracker.show = (questState) => {
    tracker.activeQuest = questState

    tracker.panelShadow.setVisible(true)
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
      ? `Concluida - ${questState.description}`
      : `${questState.progress}/${questState.requiredAmount} - ${questState.description}`

    tracker.progressText.setText(status)
  }

  tracker.hide = () => {
    tracker.activeQuest = null
    tracker.panelShadow.setVisible(false)
    tracker.panel.setVisible(false)
    tracker.titleText.setVisible(false)
    tracker.progressText.setVisible(false)
  }

  return tracker
}
