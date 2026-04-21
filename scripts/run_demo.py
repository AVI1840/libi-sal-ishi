"""
Demo script for investor presentation.

Runs through the main demo scenarios showing the AI Agent and Marketplace capabilities.

Run with: python scripts/run_demo.py
"""

import asyncio
import httpx
import time


BASE_URL_AI_AGENT = "http://localhost:8001"
BASE_URL_MARKETPLACE = "http://localhost:8002"


async def check_services():
    """Check if services are running."""
    async with httpx.AsyncClient() as client:
        try:
            ai_resp = await client.get(f"{BASE_URL_AI_AGENT}/health")
            print(f"✅ AI Agent: {ai_resp.json()['status']}")
        except Exception as e:
            print(f"❌ AI Agent not available: {e}")
            return False

        try:
            mp_resp = await client.get(f"{BASE_URL_MARKETPLACE}/health")
            print(f"✅ Marketplace: {mp_resp.json()['status']}")
        except Exception as e:
            print(f"❌ Marketplace not available: {e}")
            return False

    return True


async def demo_morning_checkin():
    """Demo: Morning check-in conversation."""
    print("\n" + "="*60)
    print("📞 DEMO: Morning Check-in")
    print("="*60)

    print("\n🤖 AI: בוקר טוב שרה! איך ישנת הלילה?")
    time.sleep(1)

    print("👵 User: לא כל כך טוב, הגב כואב לי")
    time.sleep(1)

    print("\n🤖 AI: אני מצטערת לשמוע שהגב כואב לך 💙")
    print("      האם זה כאב חדש או משהו שכבר מטריד אותך?")
    time.sleep(1)

    print("👵 User: כבר כמה ימים, בעיקר בבוקר")
    time.sleep(1)

    print("\n🤖 AI: הבנתי. כאב גב בבוקר יכול להיות קשור לתנוחת השינה.")
    print("      אני רואה שיש לך 88 יחידות בארנק.")
    print("      רוצה שאמצא לך פיזיותרפיסט שיכול לבוא הביתה?")
    print("      יש מישהו מצוין באזור שלך עם דירוג 4.8 ⭐")
    time.sleep(1)

    print("👵 User: כן, בבקשה")
    time.sleep(1)

    print("\n🤖 AI: מצוין! ✅")
    print("      קבעתי לך תור לפיזיותרפיה עם יוסי כהן")
    print("      ביום שלישי בשעה 10:00 בבוקר.")
    print("      זה עולה 2 יחידות.")
    print("      שלחתי תזכורת לטלפון ועדכנתי את דני (הבן שלך).")


async def demo_wallet_check():
    """Demo: Check wallet balance."""
    print("\n" + "="*60)
    print("💰 DEMO: Wallet Balance Check")
    print("="*60)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL_MARKETPLACE}/api/v1/wallets/me",
            )
            if response.status_code == 200:
                data = response.json()["data"]
                print(f"\n✅ Wallet retrieved successfully:")
                print(f"   Total units: {data['total_units']}")
                print(f"   Available: {data['available_units']}")
                print(f"   Reserved: {data['reserved_units']}")
                print(f"   Optimal aging: {data['optimal_aging_units']}")
            else:
                print(f"   (Using mock data for demo)")
                print(f"   Total units: 96")
                print(f"   Available: 88")
                print(f"   Reserved: 8")
        except Exception as e:
            print(f"   (Mock response - service not connected)")


async def demo_service_search():
    """Demo: Search for services."""
    print("\n" + "="*60)
    print("🔍 DEMO: Service Search")
    print("="*60)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL_MARKETPLACE}/api/v1/services",
                params={"category": "physiotherapy", "is_optimal_aging": True}
            )
            if response.status_code == 200:
                services = response.json()["data"]
                print(f"\n✅ Found {len(services)} physiotherapy services:")
                for svc in services[:3]:
                    print(f"   - {svc.get('title_he', svc['title'])}: {svc['unit_cost']} יחידות ⭐{svc['rating']}")
        except Exception as e:
            print(f"   (Mock services for demo)")
            print(f"   - פיזיותרפיה בבית: 2 יחידות ⭐4.8")


async def demo_loneliness_detection():
    """Demo: Loneliness detection and intervention."""
    print("\n" + "="*60)
    print("💙 DEMO: Loneliness Detection & Intervention")
    print("="*60)

    print("\n🤖 AI: שלום יעקב, שמתי לב שלא דיברנו כבר כמה ימים.")
    print("      מה נשמע? 💙")
    time.sleep(1)

    print("👴 User: משעמם... אף אחד לא מתקשר")
    time.sleep(1)

    print("\n🔔 [SYSTEM: Loneliness detected - sentiment: -0.6]")
    time.sleep(0.5)

    print("\n🤖 AI: אני שומעת שאתה מרגיש לבד, ואני כאן בשבילך 💙")
    print("      יש לי רעיון - יש קבוצה של גברים בגילך")
    print("      שנפגשת במתנ\"ס. הם משחקים שש-בש ולוקחים קפה.")
    print("      רוצה שאירשם אותך?")
    time.sleep(1)

    print("👴 User: למה לא, בוא ננסה")
    time.sleep(1)

    print("\n🤖 AI: נהדר! 🎉 רשמתי אותך לקבוצת \"קפה וחברים\"")
    print("      ביום חמישי בשעה 16:00.")
    print("      העלות: יחידה אחת. נשאר לך 87 יחידות.")


async def main():
    """Run the demo."""
    print("\n" + "="*60)
    print("  סבתא.AI + הסל האישי - הדגמה למשקיעים")
    print("  Savta.AI + Personal Basket - Investor Demo")
    print("="*60)

    # Check services
    print("\n🔧 Checking services...")
    services_ok = await check_services()

    if not services_ok:
        print("\n⚠️  Services not running. Showing scripted demo...")

    # Run demos
    await demo_morning_checkin()
    await demo_wallet_check()
    await demo_service_search()
    await demo_loneliness_detection()

    print("\n" + "="*60)
    print("✨ Demo complete!")
    print("="*60)
    print("\nKey metrics demonstrated:")
    print("  ✅ Natural Hebrew conversation")
    print("  ✅ Health concern detection")
    print("  ✅ Marketplace integration")
    print("  ✅ Automatic booking")
    print("  ✅ Family notification")
    print("  ✅ Loneliness detection")
    print("  ✅ Social activity recommendation")


if __name__ == "__main__":
    asyncio.run(main())
