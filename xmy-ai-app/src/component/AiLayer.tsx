import { ScrollView, StyleSheet, useWindowDimensions, View, Text, Pressable } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import WebView from "react-native-webview";
import { useHeaderHeight } from "../config/config";
import { useXmy } from "../context/XmyContext";
import { useCallback, useEffect, useRef } from "react";
import { actionBus, messageBus } from "../context/EventBus";
import { variables } from "../context/variables";
import { Aio } from "../context/XmyType";

export function AiLayer() {
  const aiRefs = useRef<Array<{el: WebView | null, aio: Aio}>>([]);
  const { pages, aios, smallScreenMode, setState } = useXmy();
  const statusBarHeight = getStatusBarHeight();
  const headerHeight = useHeaderHeight();
  const { width, height } = useWindowDimensions();

  const lsm = !smallScreenMode;

  let aiWidth = width  * 0.86;
  if (width > 1800) {
    aiWidth = width * (lsm ? 0.2 : 0.25)
  } else if (width > 1500) {
    aiWidth = width * (lsm ? 0.25 : 0.3)
  } else if (width > 1180) {
    aiWidth = width * (lsm ? 0.3 : 0.4)
  } else if (width > 900) {
    aiWidth = width * (lsm ? 0.38 : 0.5)
  } else if (width > 680) {
    aiWidth = width * (lsm ? 0.45 : 0.6)
  } else if (width > 380) {
    aiWidth = width * (lsm ? 0.6 : 0.8)
  }
  const aiHeight = height - statusBarHeight - headerHeight - 20;

  useEffect(() => {
    messageBus.on(ques => {
      for (const { el, aio } of aiRefs.current) {
        if (!el) {
          continue
        }
        const aioHelpers = variables.aioHelpers
        const script = `${aioHelpers};(${aio.sendMsg})("${ques.replace(/\n/g, '\\n').replace(/`/g, '\\`').replace(/"/g, '\\"')}")`
        console.log(script)
        el.injectJavaScript(script)
      }
    })
  }, [aiRefs]);

  const pcUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

  const onCurrentAiClick = useCallback((aiIndex: number, aiKey?: string) => {
    setState(state => ({
      ...state,
      quesBtn: false,
    }));
    actionBus.emit("showAiSelector", aiIndex, aiKey)
  }, [setState])

  return (
    <View style={[styles.aiLayer]}>
      <View style={{ height: statusBarHeight + headerHeight }}/>
      <ScrollView 
        style={styles.aiViewPoint} 
        horizontal={true} 
        showsHorizontalScrollIndicator={true}
      >
        {(pages.length ? [...pages, "new"] : []).map((page, index) => {
          const aio = aios[page]
          if (!aio && page !== "new") {
            return null;
          }
          return (
            <View key={page} style={[styles.aiView, {width: aiWidth, height: aiHeight}]}> 
              {page === "new" 
                ? (
                  <Pressable 
                    style={[styles.newView, {width: aiWidth, height: aiHeight}]}
                    onPress={() => onCurrentAiClick(index)}
                  >
                    <Text style={styles.newText}>+</Text>
                  </Pressable>
                )
                : (<>
                  <Pressable 
                    style={styles.currentAi} 
                    onPress={() => onCurrentAiClick(index, page)}
                  >
                    <Text style={styles.currentAiText}>{aio.name}</Text>
                  </Pressable >
                  <WebView 
                    nestedScrollEnabled
                    ref={el => {aiRefs.current[index] = {el, aio}}}
                    style={{width: aiWidth, height: aiHeight}}
                    source={{uri: aio.url}}
                    userAgent={aio.pcUA ? pcUA : undefined}
                  />
                </>)
              }
            </View>
          );
        })}
      </ScrollView>
    </View>
  )  
}

const styles = StyleSheet.create({
  aiLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  aiViewPoint: {
    flexDirection: "row",
    flex: 1,
  },
  newView: {
    justifyContent: "center",
    alignItems: "center"
  },
  newText: {
    fontSize: 38,
  },
  aiView: {
    position: "relative",
    marginTop: 12,
    marginLeft: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  currentAi: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    borderRadius: 2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: "#aaa",
    borderBottomColor: "#aaa",
    paddingVertical: 1,
    paddingHorizontal: 5,
    backgroundColor: '#eeec'
  },
  currentAiText: {
    color: "#333",
    fontSize: 12
  }
});